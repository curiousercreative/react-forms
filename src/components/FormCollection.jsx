import React from 'react';
import memo from 'memoize-one';

import Form from './Form.jsx';

import bindMethods from '../util/bindMethods.js';
import { validate } from '../lib/validator';

import getFieldTopic from './fields/util/getFieldTopic';

import FormContext from './config/FormContext';

const defaultIsNew = data => !('id' in data);

/**
 * @class FormCollection
 * @extends Form
 * @property {string} [className = '']
 * @property {React.Component} [component]
 * @property {function} [delete] Object => Promise
 * @property {string} [formName = '']
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
 * @property {object[]} [values = []] set initial values NOTE: if you're passing values in,
 * consider overwriting setValue and getValue in your instance so field values are
 * always passed down
 * @return {jsx} form.form, though this class is frequently extended rather than
 * used directly and the render method is overriden
 */
export default class FormCollection extends Form {
  static defaultProps = {
    ...Form.defaultProps,
    defaultValues: {},
    shouldRespondToValuesUpdatedInProps: true,
    values: [],
  };

  /** @property {number} cid - client id, FormCollection managed index */
  cid = 0;

  constructor (...args) {
    super(...args);
    bindMethods(this);

    this.state.values = this.state.values || this.props.values || [];
    this.state.errors = [];

    // populate our FormCollection with data
    this.state.values = this.state.values.map(this.create);

    // init any lists per collection item
    this.state.values.forEach(() => {
      this.fieldsBlurred.push([]);
      this.state.errors.push([]);
    });

    this._getData = memo(this._getData);
    this._getDataWithCid = memo(this._getDataWithCid);
  }

  _getData (tempValues, persistentValues) {
    const data = tempValues.map(temporaryData => {
      const persistentData = persistentValues.find(({ id }) => id === temporaryData.id);
      return { ...persistentData, ...temporaryData };
    });

    return data;
  }

  _getDataWithCid (tempValues, persistentValues) {
    const data = this._getData(tempValues, persistentValues);

    data.forEach(item => delete item.cid);

    return data;
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

    return this.getErrors().map((errs, i) => (
      // keep the previous errors except for this field
      // add the errors for just this field
      i === index ? [ ...errs.filter(e => e.name !== name), ...fieldErrors ] : errs
    ));
  }

  handleClickAdd () {
    this.add();
  }

  handleClickRemove (e) {
    const index = Number(e.target.value);

    this.remove(index);
  }

  /**
   * add - create a new default object and add to collection
   * @param {object} [attr] - model attributes to merge in while adding
   */
  add (attr={}) {
    // default object with a cid merged over
    let object = this.create(attr);

    // add a default object to the end of the collection
    this.setState({
      errors: [ ...this.getErrors(), [] ],
      values: this.state.values.concat(object),
    });

    // init lists for this new item
    this.fieldsBlurred.push([]);
  }

  /**
   * add - create a new default object and add to collection
   * @param {object} [attr] - model attributes to merge in while adding
   * @return {object}
   */
  create (attr={}) {
    // default object with a cid merged over
    return { ...this.props.defaultValues, cid: this.getCid(), ...attr };
  }

  getCid () {
    return `c${this.cid++}`;
  }

  /**
   * getData - merges persistent collection with temporary collection
   * @param  {boolean} [omitCid = true]
   * @return {collection} merged collection
   */
  getData (omitCid = true) {
    return omitCid
      ? this._getData(this.state.values, this.props.values)
      : this._getDataWithCid(this.state.values, this.props.values);
  }

  /**
   * @param {number} [index]
   * @return {Error[]} collection of errors (name, error) or potentially a list of these collections?
   */
  getErrors (index) {
    const errors = Array.isArray(this.state.errors[index])
      ? this.state.errors[index]
      : this.state.errors;

    return errors || [];
  }

  // you can override me, especially if you want to read/write form state elsewhere
  // you can also override me for side effects and still call me using super
  getValue (name, index) {
    return this.getData()[index][name];
  }

  /**
   * remove - removes a temporary object or deletes a persistent object
   * @param  {object|number} dataOrIndex - the collection item to remove (or its index)
   * @param  {function} [isNew = defaultIsNew] Object => Boolean
   * @return {Promise}
   */
  remove (dataOrIndex, isNew = defaultIsNew) {
    const data = typeof dataOrIndex === 'number'
      ? this.getData()[dataOrIndex]
      : dataOrIndex;

    // if object is new, just handle in state
    if (isNew(data)) {
      this.removeTemporaryItem(data);
      return Promise.resolve();
    }

    // object isn't new, pass it to the prop function
    return this.props.delete(data)
      .then(() => this.removeTemporaryItem(data))
      .catch(errors => {
        this.handleErrors(data, errors);
        // bubble up the rejection
        throw errors;
      });
  }

  /**
   * removeTemporaryItem - remove this item from the temporary collection
   * @param  {object|string} dataOrCid - item to remove from temporary
   * MODIFIES STATE
   */
  removeTemporaryItem (dataOrCid) {
    const cid = typeof dataOrCid === 'string'
      ? dataOrCid
      : dataOrCid.cid;

    this.setState({
      values: this.state.values.filter(obj => obj.cid !== cid),
    });
  }

  /**
   * setValue - Sets form field value in form state. You can override me, especially
   * if you want to read/write form state elsewhere. You can also override me for
   * side effects and still call me using super.setValue
   * @param {string} name
   * @param {string|any} value
   * @param {string} [context = 'field'] an identifier for where/why setValue is being called
   * @param {number} index
   * @returns {Promise}
   */
  setValue (name, value, context, index) {
    return new Promise(resolve => {
      // don't touch any values except for index requested
      const values = this.state.values.map((v, i) => (
        i === index
          ? { ...v, [name]: value }
          : v
      ));

      this.setState({ values }, () => {
        // NOTE: overriding this method will require reimplementing this pubsub messga
        // publish a message to let field respond to external update
        let topic = `${getFieldTopic(name)}.updated`;
        const data = [ name, value, context, index ];
        if (context !== 'field') topic += '.fromAbove';
        this.props.pubsub.trigger(topic, data);
        this.props.pubsub.trigger('field.updated', data);

        resolve();
      });
    });
  }

  /**
   * validate - validate the entire form and render errors (unless disabled)
   * @param  {Boolean} [displayErrors=true] flag to disable error rendering
   * @return {boolean} true = valid
   */
  validate (displayErrors = true) {
    let state = {};
    // arrayify to  FormCollection
    const errors = this.getData()
      .map(data => validate(data, this.getValidations()));

    // if there are any, form is invalid
    const isValid = this.isValid = !errors.some(eArr => eArr.length > 0);

    // store errors for rendering
    if (displayErrors) state.errors = errors;

    this.setState({ ...state, isValid });

    // if there are no errors, form is valid
    return isValid;
  }

  render (Component, componentProps) {
    const formCollectionData = this.getData(false);
    Component = Component || this.props.component;

    return (
      <FormContext.Provider value={this.getContextValue(formCollectionData, this.getErrors())}>
        {formCollectionData.map((data, i) => <Component
          {...data}
          {...componentProps}
          handleClickRemove={this.handleClickRemove}
          index={i}
          key={data.cid} />)}
      </FormContext.Provider>
    );
  }
}
