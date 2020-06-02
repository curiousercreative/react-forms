import React from 'react';
import memoize from 'memoize-one';

import bindMethods from '../util/bindMethods.js';
import debounce from '../util/debounce.js';
import renderIf from '../util/renderIf.js';
import uniq from '../util/uniq.js';

import { Pubsub } from '../lib/pubsub';
import { pascalize } from '../lib/transformers';
import { validate } from '../lib/validator';

import getFieldTopic from './fields/util/getFieldTopic';

import FormContext from './config/FormContext';

const CHANGE_FIELD_VALIDATION_DEBOUNCE_PERIOD = 60;

/**
 * @class Form
 * @property {string} [className = '']
 * @property {string} [formName = '']
 * @property {boolean} [shouldRespondToValuesUpdatedInProps = false] when true, will
 * call Form.filterIncomingValuesToUpdate and Form.updateValuesFromIncomingProps
 * @property {boolean} [validateAsYouGo = true]
 * @property {collection} [validations = []] - very specific data structure expected by
 * the validate function. The below example is for a form with two fields that are both required.
 * It should look like this:
 * import { messages, tests } from 'lib/validator';
 *
 * validations = [{
 *   names: ['username', 'password'],
 *   tests: [[ tests.required, messages.required ]]
 * }]
 * @property {object} [values = {}] set initial values NOTE: if you're passing values in,
 * consider overwriting setValue and getValue in your instance so field values are
 * always passed down
 * @return {jsx} form.form, though this class is frequently extended rather than
 * used directly and the render method is overriden
 */
export default class Form extends React.Component {
  static contextType = FormContext;
  static defaultProps = {
    className: '',
    formName: 'form',
    shouldRespondToValuesUpdatedInProps: false,
    validateAsYouGo: true,
    validations: [],
    values: {},
  };

  /** @property {array} fieldsBlurred - list of field names that have been blurred used for validating as you go */
  fieldsBlurred = [];
  /** @property {boolean} isValid - keep this instance flag to allow us immediate get/set  */
  isValid;
  state = {};

  constructor (...args) {
    super(...args);
    bindMethods(this);

    this.state.errors = [];
    this.state.values = this.state.values || this.props.values || {};

    this._validateOnChange = debounce(this._validateOnChange, CHANGE_FIELD_VALIDATION_DEBOUNCE_PERIOD, false);
    this.getContextValue = memoize(this.getContextValue);
    this.filterIncomingValuesToUpdate = memoize(this.filterIncomingValuesToUpdate);
    this.updateValuesFromIncomingProps = memoize(this.updateValuesFromIncomingProps);

    this.pubsub = new Pubsub();
  }

  componentDidMount () {
    setTimeout(() => this.validate(false), 120);
  }

  componentDidUpdate (props) {
    if (this.props.shouldRespondToValuesUpdatedInProps) {
      const fieldsToUpdate = this.filterIncomingValuesToUpdate(props.values, this.props.values);

      if (fieldsToUpdate.length) this.updateValuesFromIncomingProps(fieldsToUpdate);
    }
  }

  componentWillUnmount () {
    // the timeout is a bit hacky, but our children components unmount hook
    // gets called after the parent otherwise
    setTimeout(() => {
      // this should clear all subscriptions for all namespaces within this form
      this.pubsub.off();
      delete this.pubsub;
    }, 60);
  }

  /**
   * _onFieldBlur - Field.jsx should call this when a field blurs
   * @param  {string} name
   * @param  {number} [index]
   */
  _onFieldBlur (name, index) {
    // validate if we're validating as we go
    if (this.props.validateAsYouGo) this._validateOnChange(name, index);

    this._addFieldBlurred(name, index);
  }

  /**
   * _hasFieldBlurred - has this field previously been blurred?
   * @param  {string} name
   * @param  {number} [index]
   * @return {boolean}
   */
  _hasFieldBlurred (name, index) {
    const fieldsBlurred = Array.isArray(this.fieldsBlurred[index])
      ? this.fieldsBlurred[index]
      : this.fieldsBlurred;

    return fieldsBlurred.includes(name);
  }

  /**
   * _addFieldBlurred - add this field to list of fields previously blurred
   * @param  {string} name
   * @param  {number} [index]
   */
  _addFieldBlurred (name, index) {
    const fieldsBlurred = Array.isArray(this.fieldsBlurred[index])
      ? this.fieldsBlurred[index]
      : this.fieldsBlurred;

    this.fieldsBlurred = uniq(fieldsBlurred.concat(name));
  }

  /**
   * _getErrors - Field.jsx should call this during render
   * @param  {string} name
   * @param  {number} [index]
   * @return {Error[]} collection of error objects (name, error)
   */
  _getFieldErrors (name, index) {
    return this.getErrors(index).filter(e => e.name === name);
  }

  /**
   * _getValue - util/getValue calls this
   * @param  {string} name
   * @param  {number} [index]
   * @return {string|any}
   */
  _getValue (name, index) {
    // if we don't have a field specific setter, make one based on setValue
    if (!this[`getValueFor${pascalize(name)}`]) {
      this[`getValueFor${pascalize(name)}`] = this.getValue.bind(this, name);
    }
    // if we don't have a field specific parser, make one based on parseValue
    if (!this[`parseValueFor${pascalize(name)}`]) {
      this[`parseValueFor${pascalize(name)}`] = this.parseValue.bind(this, name);
    }

    const getter = this[`getValueFor${pascalize(name)}`];
    const parser = this[`parseValueFor${pascalize(name)}`];

    return parser(getter(index));
  }

  /**
   * _setValue - util/setValue calls this
   * @param {string} name
   * @param {string|any} value
   * @param {string} context
   * @param {number} [index]
   * @return {Promise}
   */
  _setValue (name, value, context, index) {
    // if we don't have a field specific setter, make one based on setValue
    if (!this[`setValueFor${pascalize(name)}`]) {
      this[`setValueFor${pascalize(name)}`] = this.setValue.bind(this, name);
    }
    // if we don't have a field specific cleaner, make one based on cleanValue
    if (!this[`cleanValueFor${pascalize(name)}`]) {
      this[`cleanValueFor${pascalize(name)}`] = this.cleanValue.bind(this, name);
    }

    const cleaner = this[`cleanValueFor${pascalize(name)}`];
    const setter = this[`setValueFor${pascalize(name)}`];

    return setter(cleaner(value), context, index)
      .then(() => {
        // validate this field as the value changes if we're doing that
        if (this.props.validateAsYouGo) {
          // display field errors if it's been previously blurred
          this._validateOnChange(name, index);
        }
      });
  }

  /**
   * _validateField - run validations for a single field and return next state of form errors
   * @param  {string} name
   * @param  {number} [index]
   * @return {object[]} errors
   */
  _validateField (name, index) {
    const data = { [name]: this.getValue(name, index) };

    // validate just this field
    const fieldErrors = validate(data, this.getValidations(), false);

    return [
      // keep the previous errors except for this field
      ...this.getErrors(index).filter(e => e.name !== name),
      // add the errors for just this field
      ...fieldErrors,
    ];
  }

  /**
   * _validateOnChange - validation to occur on change and blurs (should be debounced in constructor)
   * @param {string} name
   * @param {number} [index]
   */
  _validateOnChange (name, index) {
    const showError = this._hasFieldBlurred(name, index);
    // validate just the field that was changed
    this.validateField(name, index, showError);
    // validate entire form (hide new errors) to set isValid flag
    this.validate(false);
  }

  /**
   * filterIncomingValuesToUpdate - filter incoming values to remove ones that
   * haven't changed from the last incoming value
   * @param  {object} oldValues
   * @param  {object} newValues
   * @return {array} format as returned by Object.entries
   */
  filterIncomingValuesToUpdate (oldValues, newValues) {
    // for each incoming form value
    return Object
      // convert to a list of map like arrays
      .entries(newValues)
      // filter out fields that haven't changed
      .filter(([ name, value ]) => {
        const oldVal = oldValues[name];

        return oldVal !== value;
      });
  }

  getContextValue (values, errors) {
    return {
      actions: {
        setValue: this._setValue,
      },
      state: {
        form: this,
        errors,
        values,
      },
    };
  }

  /**
   * @return {object} keyed by field name
   */
  getData () {
    return this.state.values;
  }

  /**
   * @return {Error[]} collection of errors (name, error)
   */
  getErrors () {
    return this.state.errors;
  }

  /**
   * override this for any conditional validations?
   * @return {Validation[]} collection of validations
   */
  getValidations () {
    return this.props.validations;
  }

  /**
   * getValue - Retrieves form field value from form state. You can override me,
   * especially if you want to read/write form state elsewhere. You can also
   * override me for side effects and still call me using super.getValue
   * @param  {string} name
   * @return {string|any}
   */
  getValue (name) {
    return this.getData()[name];
  }

  /**
   * cleanValue - transform data coming from user input before it's stored
   * @param {string} name
   * @param {string|any} value
   * @return {any}
   */
  cleanValue (name, value) {
    return value;
  }

  /**
   * parseValue - transform stored data before sending to form field
   * @param {string} name
   * @param {string|any} value
   * @return {string}
   */
  parseValue (name, value) {
    return value;
  }

  /**
   * setValue - Sets form field value in form state. You can override me, especially
   * if you want to read/write form state elsewhere. You can also override me for
   * side effects and still call me using super.setValue
   * @param {string} name
   * @param {string|any} value
   * @param {string} context an identifier for where/why setValue is being called
   * @returns {Promise}
   */
  setValue (name, value, context) {
    return new Promise(resolve => {
      this.setState({
        values: { ...this.state.values, [name]: value },
      }, () => {
        // NOTE: overriding this method will require reimplementing this pubsub messga
        // publish a message to let field respond to external update
        if (context !== 'field') this.pubsub.trigger(`${getFieldTopic(name)}.updatedFromAbove`, value);

        resolve();
      });
    });
  }

  resetErrors () {
    this.setState({ errors: [] });
  }

  /**
   * setErrors - save errors for rendering
   * @param {array} errors
   */
  setErrors (errors) {
    this.setState({ errors });
  }

  /**
   * validate - validate the entire form and render errors (unless disabled)
   * @param  {Boolean} [displayErrors=true] flag to disable error rendering
   * @return {boolean} true = valid
   */
  validate (displayErrors = true) {
    let state = {};
    // arrayify to  FormCollection
    const errors = validate(this.getData(), this.getValidations());

    // if there are any, form is invalid
    const isValid = this.isValid = errors.length === 0;

    // store errors for rendering
    if (displayErrors) state.errors = errors;

    this.setState({ ...state, isValid });

    // if there are no errors, form is valid
    return isValid;
  }

  /**
   * validateField - validate a single field (while preserving all other field errors)
   * @param  {string}  name - the field to validate
   * @param  {number} [index]
   * @param  {Boolean} [displayErrors=true]
   * @return {boolean} true = valid
   */
  validateField (name, index, displayErrors = true) {
    const errors = this._validateField(name, index);

    // store errors for rendering
    if (displayErrors) this.setState({ errors });

    return errors.length === 0;
  }

  /**
   * updateValuesFromIncomingProps - respond to updated incoming form values (side effects welcome)
   * @param  {array[]} fieldsToUpdate - key, value arrays as Object.entries would return
   * @return {Promise} resolves once all side effects are complete
   */
  updateValuesFromIncomingProps (fieldsToUpdate) {
    // update each field
    return Promise.all(fieldsToUpdate.map(([ name, value ]) => this.setValue(name, value, 'props')))
      // with all fields updated, validate the form against updated values (show errors if previously shown)
      .then(() => this.validate(this.getErrors().length > 0))
      // publish a message for the completion of this process
      .then(() => this.pubsub.trigger('valuesUpdatedFromProps'));
  }

  renderErrors (includeFieldErrors = false) {
    // always include critical (non-field) errors
    let errors = this.getErrors()
      .filter(e => typeof e === 'string')
      .map(e => <li className="form__error" key={e}>{e}</li>);

    if (includeFieldErrors) {
      errors = errors.concat(this.getErrors()
        .filter(e => e.name && e.error)
        .map(e => <li className="form__error" key={e.error}>{e.error}</li>)
      );
    }

    return (
      <ul className="form__errors">
        {errors}
      </ul>
    );
  }

  /**
   * this render method is most often overridden by the subclass
   * @param {jsx} [jsx] jsx to be supplied by subclass, optional since we can
   * theoretically render a Form without subclassing
   * @return {jsx} form or anything really
   */
  render (jsx) {
    let classes = this.props.className.split(' ').concat('form');

    return (
      <FormContext.Provider value={this.getContextValue(this.getData(), this.getErrors())}>
        {renderIf(jsx, () => jsx, () => (
          <form className={classes.join(' ')}>
            {this.renderErrors()}
            {this.props.children}
          </form>
        ))}
      </FormContext.Provider>
    );
  }
}
