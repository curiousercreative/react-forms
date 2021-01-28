/** @module components/Form */
import React from 'react';
import memoize from 'memoize-one';
import { unstable_batchedUpdates } from 'react-dom';

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

import { promisify } from '../lib/transformers';
import { Pubsub } from '../lib/pubsub';
import { validate } from '../lib/validator';

const CHANGE_FIELD_VALIDATION_DEBOUNCE_PERIOD = 60;

const defaultStore = localStateStore;

/**
 * @class Form
 * @property {string} [className = '']
 * @property {object[]|string[]|array[]} errors - supports errors as list of strings,
 * internal errors collection { name, error } or entries [ name, error ]
 * @property {string} [formName = 'form'] recommended, used for field className
 * generation for form specific style selectors
 * @property {number} [index] when used as a nested "field" in a FormCollection
 * @property {object} [initialValues = {}]
 * @property {FormModel|function} [model] supply any number of model overrides
 * @property {string} [name] when used as a nested "field"
 * @property {Pubsub} [pubsub] an existing Pubsub instance, perhaps you want to
 * observe several forms at once?
 * @property {FormStore|function} [store] supply any number of store overrides
 * @property {boolean} [validateAsYouGo = true]
 * @property {object[]} [validations] - very specific data structure expected by
 * the validate function. The below example is for a form with two fields that are both required.
 * It should look like this:
 * import { messages, tests } from 'lib/validator';
 *
 * validations = [{
 *   names: ['username', 'password'],
 *   tests: [[ tests.required, messages.required ]]
 * }]
 * @property {object} [values] if you plan to manage storing form values, pass them in here.
 * Be sure you are passing in a store prop with setValue methods
 * @return {jsx} .form
 */
export default class Form extends React.Component {
  static contextType = FormContext;
  static defaultProps = {
    className: '',
    errors: [],
    formName: 'form',
    initialValues: {},
    model: {},
    store: {},
    validateAsYouGo: true,
  };

  /** @property {array} fieldsBlurred - list of field names that have been blurred used for validating as you go */
  fieldsBlurred = [];
  /** @property {object} model - set of functions that are generally specific to a data model */
  model = {};
  /** @property {boolean} parentFormWarned - a flag to prevent repeating warning message */
  parentFormWarned = false;
  /** @property {object} pubsub - a Pubsub instance for messaging. Defaults to a 1:1 relationship with Form instance, but can be a shared Pubsub instance provided via props */
  pubsub = {};
  state = {};
  /** @property {object} store - set of functions that are generally specific to a data store (redux, another component's state, etc) */
  store = {};
  /** @property {boolean} wasValidated - flag for entire form being validated with errors displayed  */
  wasValidated = false;

  constructor (...args) {
    super(...args);
    bindMethods(this);

    this._setModel = memoize(this._setModel);
    this._setStore = memoize(this._setStore);
    this._validateOnChange = debounce(this._validateOnChange, CHANGE_FIELD_VALIDATION_DEBOUNCE_PERIOD, true);
    this.formatData = memoize(this.formatData);
    this.getContextValue = memoize(this.getContextValue);

    // if we didn't receive a pubsub instance, create a new one specific to this Form.
    this.pubsub = this.props.pubsub || new Pubsub();

    // init
    this._setModel(this.props.model);
    this._setStore(this.props.store);
    this.store.initErrors([]);
    this.store.initData(this.props.initialValues);

    // accept validations as component prop and override model.validations (not encouraged anyhow)
    this.model.validations = this.props.validations || this.props.model.validations || [];
  }

  componentDidMount () {
    setTimeout(() => this.validate(false), 15);
    this.pubsub.on(getFieldTopic(null, 'updated'), this.onFieldUpdate);
    this.pubsub.on(getFieldTopic(null, 'blurred'), this.onFieldBlur);
  }

  componentDidUpdate () {
    // TODO: how to best support changing model and store props?
    this._setModel(this.props.model);
    this._setStore(this.props.store);

    this.pubsub = this.props.pubsub || this.pubsub;
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
   * _getFieldErrors - Field.jsx should call this during render
   * @param  {string} name
   * @param  {number} [index]
   * @return {Error[]} collection of error objects (name, error)
   */
  _getFieldErrors (name, index) {
    return this.getErrors(index).filter(e => e.name === name);
  }

  _normalizeError (error) {
    switch (typeof error) {
      case 'string':
        return { error };
      case 'object':
        return Array.isArray(error) && error.length
          ? { name: error[0], error: error[1] }
          : error;
      default:
        return error;
    }
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
    const errors = validate(this.getData(), this.getValidations());
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
    if (!this.props.validateAsYouGo) return;

    // we want to render an error if this field has already been blurred or we've
    // previously and visibly validated the entire form
    const showError = this.wasValidated || this._hasFieldBlurred(name, index);
    // validate just the field that was changed (but returns all form errors)
    const isValid = this.validateField(name, index, showError);

    // update form valid flag
    this.setState({ isValid });
  }

  /**
   * onFieldBlur - Field.jsx should call this when a field blurs
   * @param  {string} name
   * @param  {number} [index]
   */
  onFieldBlur ({ name, index }) {
    this._validateOnChange(name, index);
    this._addFieldBlurred(name, index);
  }

  onFieldUpdate ({ name, value, context, index }) {
    this._validateOnChange(name, index);
  }

  formatData (data) {
    // run field level hooks
    const formattedValues = fromEntries(Object.entries(data)
      .map(([ name, val ]) => [ name, this.model.formatValue(name, val) ]));

    // run model level hook
    return this.model.formatModel(formattedValues);
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
    return this.store.getErrors()
      .concat(this.props.errors)
      .map(this._normalizeError);
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
   * @return {string|any}
   */
  getValue (name) {
    return this.getData()[name];
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
    // NOTE: may require refactor, this is to overcome our valid state not being
    // stored in state and triggering a re-render
    if (errors.length !== this.getErrors().length) this.forceUpdate();

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
    return promisify(this.store.setValue(name, value, index))
      // NOTE: overriding this method will require reimplementing this
      // publish a message to let field respond to external update
      .then(() => this.pubsub.trigger(getFieldTopic(name, 'updated'), { index, name, value, context }));
  }

  setValueFromField (name, value, context, index) {
    const cleanedVal = this.model.cleanValue(name, value);
    return this.setValue(name, cleanedVal, context, index);
  }

  /**
   * validate - validate the entire form and render errors (unless disabled)
   * @param  {Boolean} [displayErrors=true] flag to disable error rendering
   * @return {boolean} true = valid
   */
  validate (displayErrors = true) {
    const [ isValid, errors ] = this._validate();

    // NOTE: might need to unwrap this for React v17
    unstable_batchedUpdates(() => {
      this.setState({ isValid });

      // store errors for rendering
      if (displayErrors) {
        this.setErrors(errors);
        this.wasValidated = true;
      }
    });

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
    if (displayErrors) this.setErrors(errors);

    return errors.length === 0;
  }

  renderErrors (includeFieldErrors = false) {
    // always include critical (non-field) errors
    let errors = this.getErrors()
      .filter(({ name }) => !name)
      .map(({ error }) => <li className="form__error" key={error}>{error}</li>);

    if (includeFieldErrors) {
      errors = errors.concat(this.getErrors()
        .filter(e => e.name && e.error)
        .map(({ error }) => <li className="form__error" key={error}>{error}</li>)
      );
    }

    return (
      <ul className="form__errors">
        {errors}
      </ul>
    );
  }

  /**
   * @param {jsx} [jsx] for subclassed Form, a render method's returned jsx will
   * be wrapped in `super.render()` to provide FormContext
   * NOTE: we have three different render scenarios:
   * 1. Subclassed where form content is passed to render method: super.render(<SomeComponentTree />)
   * 2. Render "prop" (component passed as child): <Form>{SomeComponent}</Form>
   * 3. Simple children: <Form><SomeComponentTree /></Form>
   * scenario 3 is the simplest and most intuitive, however it lacks the ability
   * to read form values for conditional rendering.
   * @return {jsx} .form or subclassed render method's jsx
   */
  render (jsx) {
    let classes = this.props.className.split(' ').concat('form');
    const context = this.getContextValue(this.formatData(this.getData()), this.getErrors());
    const renderProps = {
      errors: context.state.errors,
      form: context.form,
      pubsub: context.pubsub,
      renderErrors: this.renderErrors,
      values: context.state.values,
    };
    const Child = typeof this.props.children === 'function' && this.props.children;

    return (
      <FormContext.Provider value={context}>
        <div className={classes.join(' ')}>
          {renderIf(jsx, () => jsx)}
          {renderIf(Child, () => <Child {...renderProps} />)}
          {renderIf(typeof this.props.children !== 'function', () => this.props.children)}
        </div>
      </FormContext.Provider>
    );
  }
}
