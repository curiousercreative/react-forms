import React from 'react';
import memoize from 'memoize-one';

import FormContext from './config/FormContext';
import defaultModel from '../lib/form/models/defaultModel.js';
import getFieldTopic from './fields/util/getFieldTopic.js';
import localStateStore from '../lib/form/stores/localStateStore.js';
import { mergeObjects } from '../lib/form';

import bindMethods from '../util/bindMethods.js';
import debounce from '../util/debounce.js';
import fromEntries from '../util/fromEntries.js';
import renderIf from '../util/renderIf.js';
import uniq from '../util/uniq.js';

import { Pubsub } from '../lib/pubsub';
import { pascalize } from '../lib/transformers';
import { validate } from '../lib/validator';

const CHANGE_FIELD_VALIDATION_DEBOUNCE_PERIOD = 60;

const defaultStore = localStateStore;

/**
 * @class Form
 * @property {string} [className = '']
 * @property {string} [formName = '']
 * @property {object} [initialValues]
 * @property {object} [model]
 * @property {object} [pubsub]
 * @property {object} [store]
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
 * @return {jsx} form.form, though this class is frequently extended rather than
 * used directly and the render method is overriden
 */
export default class Form extends React.Component {
  static contextType = FormContext;
  static defaultProps = {
    className: '',
    formName: 'form',
    initialValues: {},
    model: {},
    store: {},
    validateAsYouGo: true,
    validations: [],
  };

  emptyValues = {};
  /** @property {array} fieldsBlurred - list of field names that have been blurred used for validating as you go */
  fieldsBlurred = [];
  /** @property {boolean} isValid - keep this instance flag to allow us immediate get/set  */
  isValid;
  model = {};
  parentFormWarned = false;
  state = {};
  store = {};

  constructor (...args) {
    super(...args);
    bindMethods(this);
    this.pubsub = this.pubsub || new Pubsub();

    this._setModel = memoize(this._setModel);
    this._setStore = memoize(this._setStore);
    this._validateOnChange = debounce(this._validateOnChange, CHANGE_FIELD_VALIDATION_DEBOUNCE_PERIOD, false);
    this.getContextValue = memoize(this.getContextValue);

    this._setModel(this.props.model);
    this._setStore(this.props.store);
    this.store.initErrors([]);
    this.store.initData(this.props.initialValues || this.state.values);
  }

  componentDidMount () {
    setTimeout(() => this.validate(false), 15);
    this.pubsub.on(getFieldTopic(null, 'blurred'), this._onFieldBlur);
  }

  componentDidUpdate () {
    // TODO: how to best support changing model and store props?
    // this._setModel(this.props.model);
    // this._setStore(this.props.store);
    // if (this.pubsub) this.pubsub = this.pubsub;
  }

  componentWillUnmount () {
    // the timeout is a bit hacky, but our children components unmount hook
    // gets called after the parent otherwise
    setTimeout(() => {
      // this should clear all subscriptions for all namespaces within this form
      this.pubsub.off();
    }, 60);
  }

  /**
   * _onFieldBlur - Field.jsx should call this when a field blurs
   * @param  {string} name
   * @param  {number} [index]
   */
  _onFieldBlur ({ name, index }) {
    // validate if we're validating as we go
    if (this.props.validateAsYouGo) this._validateOnChange(name, index);

    this._addFieldBlurred(name, index);
  }

  _onSetValue (name, value, context, index) {
    // validate this field as the value changes if we're doing that
    if (this.props.validateAsYouGo) {
      // display field errors if it's been previously blurred
      this._validateOnChange(name, index);
    }
    // publish a message to let field respond to external update
    let topic = `${getFieldTopic(name)}.updated`;
    const data = [ name, value, context ];
    if (context !== 'field') topic += '.fromAbove';
    this.pubsub.trigger(topic, data);
    this.pubsub.trigger('field.updated', data);
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

  _hasParentForm () {
    if (typeof this.props.name === 'string') {
      if (this.context.form instanceof Form) return true;

      if (!this.parentFormWarned) {
        console.warn('form was given a "name" prop but could not find parent form');
        this.parentFormWarned = true;
      }
    }

    return false;
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

  _setModel (model) {
    this.model = mergeObjects(this, defaultModel, model);
  }

  _setStore (...stores) {
    this.store = mergeObjects(this, defaultStore, ...stores);
  }

  /**
   * _validate - get validation results
   * @return {array} [ boolean, object[] ]
   */
  _validate () {
    const errors = validate(this.store.values(), this.getValidations());
    const isValid = errors.length === 0;

    return [ isValid, errors ];
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
   * cleanValue - wrapper for transforming user input values on their way to store
   * @param {string} name
   * @param {string|any} value
   * @return {string|any}
   */
  cleanValue (name, value) {
    const methodName = `cleanValueFor${pascalize(name)}`;
    // if we don't have a field specific cleaner, make one based on cleanValue
    if (!this.model[methodName]) this.model[methodName] = this.model.cleanValue.bind(this.model, name);

    return this.model[methodName](value);
  }

  formatData () {
    // run field level hooks
    const formattedValues = fromEntries(Object.entries(this.store.values())
      .map(([ name, val ]) => [ name, this.formatValue(name, val) ]));

    // run model level hook
    return this.model.format(formattedValues);
  }

  /**
   * formatValue - wrapper for transforming store values on their way to child components
   * @param  {string} name
   * @param  {string|any} value
   * @return {string|any}
   */
  formatValue (name, value) {
    const methodName = `formatValueFor${pascalize(name)}`;
    // if we don't have a field specific parser, make one based on parse
    if (!this.model[methodName]) this.model[methodName] = this.model.formatValue.bind(this.model, name);

    return this.model[methodName](value);
  }

  getContextValue (values, errors) {
    return {
      actions: {
        setValue: this.setValueFromField,
      },
      form: this,
      pubsub: this.pubsub,
      state: {
        errors,
        isValid: this.isValid,
        values,
      },
    };
  }

  /**
   * @return {object} keyed by field name
   */
  getData () {
    return this.store.getData();
  }

  /**
   * @return {Error[]} collection of errors (name, error)
   */
  getErrors () {
    return this.store.getErrors();
  }

  /**
   * override this for any conditional validations?
   * @return {Validation[]} collection of validations
   */
  getValidations () {
    return this.model.getValidations();
  }

  /**
   * getValue - Retrieves form field value from form state. You can override me,
   * especially if you want to read/write form state elsewhere. You can also
   * override me for side effects and still call me using super.getValue
   * @param  {string} name
   * @param  {number} [index]
   * @return {string|any}
   */
  getValue (name, index) {
    return this.model.formatValue(name, this.store.getValue(name, index));
  }

  /**
   * setData - overwrites form data
   * @param {object|any} values
   * @return {Promise}
   */
  setData (values) {
    return this.store.setData(values);
  }

  /**
   * setErrors - save errors for rendering
   * @param {array} errors
   */
  setErrors (errors) {
    this.store.setErrors(errors);
  }

  /**
   * setValue - Sets form field value in form state. Override me for side effects
   * and still call me using super.setValue
   * @param {string} name
   * @param {string|any} value (already cleaned if coming from child form field)
   * @param {string} context an identifier for where/why setValue is being called
   * @param {number} [index]
   * @returns {Promise}
   */
  setValue (name, value, context, index) {
    return this.store.setValue(name, value, index)
      // NOTE: overriding this method will require reimplementing this
      .then(() => this._onSetValue(name, value, context, index));
  }

  setValueFromField (name, value, context, index) {
    const cleanedVal = this.cleanValue(name, value);
    return this.setValue(name, cleanedVal, context, index);
  }

  /**
   * validate - validate the entire form and render errors (unless disabled)
   * @param  {Boolean} [displayErrors=true] flag to disable error rendering
   * @return {boolean} true = valid
   */
  validate (displayErrors = true) {
    const [ isValid, errors ] = this._validate();

    this.isValid = isValid;

    // store errors for rendering
    if (displayErrors) {
      this.setErrors(errors);

      // NOTE: hacky way of guessing whether we just triggered a re-render
      if (!this.state.errors) this.forceUpdate();
    }

    // if there are no errors, form is valid
    return this.isValid;
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
    if (displayErrors) this.setErrors(errors);

    return errors.length === 0;
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
      <FormContext.Provider value={this.getContextValue(this.formatData(), this.getErrors())}>
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
