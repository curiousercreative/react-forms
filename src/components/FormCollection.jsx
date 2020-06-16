import React from 'react';
import memo from 'memoize-one';

import Form from './Form.jsx';

import bindMethods from '../util/bindMethods.js';
import { validate } from '../lib/validator';

import getFieldTopic from './fields/util/getFieldTopic';
import localStateStoreCollection from '../lib/form/stores/localStateStoreCollection.js';

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
    store: localStateStoreCollection,
    values: [],
  };

  /** @property {number} cid - client id, FormCollection managed index */
  cid = 0;

  constructor (...args) {
    super(...args);
    bindMethods(this);

    this._getData = memo(this._getData);
    this._getDataWithCid = memo(this._getDataWithCid);

    const errors = [];
    const values = this.store.getPersistentData()
      .map(this.create);

    // init any lists per collection item
    values.forEach(() => {
      this.fieldsBlurred.push([]);
      errors.push([]);
    });

    this.store.initData(values);
    this.store.initErrors(errors);
  }

  _getData (tempValues, persistentValues) {
    const list = [];
    const set = new Set();

    persistentValues.concat(tempValues).forEach(a => {
      const key = this._primaryKeySelector(a);

      // we already added a persistent item
      if (key && set.has(key)) {
        const i = list.findIndex(b => key === this._primaryKeySelector(b));
        list[i] = { ...list[i], ...a };
      }
      else {
        if (key) set.add(key);
        list.push(a);
      }
    });

    return list;
  }

  _getDataWithCid (tempValues, persistentValues) {
    const data = this._getData(tempValues, persistentValues);

    data.forEach(item => delete item.cid);

    return data;
  }

  _primaryKeySelector (a) {
    return a.id;
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
   * @return {Promise}
   */
  add (attr={}) {
    // default object with a cid merged over
    let object = this.create(attr);

    // add a default object to the end of the collection
    return Promise
      .all([
        this.store.setErrors([ ...this.getErrors(), [] ]),
        this.store.setData(this.store.getData().concat(object)),
      ])
      .then(() => {
        // init lists for this new item
        this.fieldsBlurred.push([]);

        this.onAdd();
      });
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
   * @return {collection} merged collection
   */
  getData () {
    return this._getData(this.store.getData(), this.store.getPersistentData());
  }

  /**
   * @param {number} [index]
   * @return {Error[]} collection of errors (name, error) or potentially a list of these collections?
   */
  getErrors (index) {
    const errors = Array.isArray(this.state.errors[index])
      ? this.store.getErrors()[index]
      : this.store.getErrors();

    return errors || [];
  }

  // you can override me, especially if you want to read/write form state elsewhere
  // you can also override me for side effects and still call me using super
  getValue (name, index) {
    return this.getData()[index][name];
  }

  onAdd () {
    this.props.pubsub.trigger('item.added');
  }

  onRemove () {
    this.props.pubsub.trigger('item.removed');
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
      return Promise.resolve().then(this.onRemove);
    }

    // object isn't new, pass it to the prop function
    return this.props.delete(data)
      .then(() => this.removeTemporaryItem(data))
      .then(this.onRemove)
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

    this.setData(this.getData().filter(obj => obj.cid !== cid));
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
    // don't touch any values except for index requested
    const values = this.getData().map((v, i) => (
      i === index
        ? { ...v, [name]: value }
        : v
    ));

    return this.setData(values)
      .then(() => {
        // NOTE: overriding this method will require reimplementing this pubsub messga
        // publish a message to let field respond to external update
        let topic = `${getFieldTopic(name)}.updated`;
        const data = [ name, value, context, index ];
        if (context !== 'field') topic += '.fromAbove';
        this.props.pubsub.trigger(topic, data);
        this.props.pubsub.trigger('field.updated', data);
      });
  }

  /**
   * validate - validate the entire form and render errors (unless disabled)
   * @param  {Boolean} [displayErrors=true] flag to disable error rendering
   * @return {boolean} true = valid
   */
  validate (displayErrors = true) {
    // arrayify to  FormCollection
    const errors = this.getData()
      .map(data => validate(data, this.getValidations()));

    // if there are any, form is invalid
    this.isValid = !errors.some(eArr => eArr.length > 0);

    // store errors for rendering
    if (displayErrors) {
      this.setErrors(errors);

      // NOTE: hacky way of guessing whether we just triggered a re-render
      if (!this.state.errors) this.forceUpdate();
    }

    // if there are no errors, form is valid
    return this.isValid;
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
