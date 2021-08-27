/** @module components/FormCollection */
import React from 'react';

import Form from './Form.jsx';
import FormContext from './config/FormContext';
import localStateStoreCollection from '../lib/form/stores/localStateStoreCollection.js';

import bindMethods from '../util/bindMethods.js';
import callMe from '../util/callMe.js';
import curry from '../util/curry.js';
import omit from '../util/omit.js';
import { validate } from '../lib/validator';

const defaultIsNew = data => !('id' in data);
const emptyValues = [];

/**
 * @class FormCollection
 * @extends Form
 * @property {string} [className = '']
 * @property {React.Component} [component]
 * @property {object} [defaultValues] - default values of collection item when created
 * @property {function} [delete] Object => Promise
 * @property {object[]|string[]|array[]} errors - supports errors as list of strings,
 * internal errors collection { name, error } or entries [ name, error ]
 * @property {string} [formName = 'form'] recommended, used for field className
 * generation for form specific style selectors
 * @property {number} [index] when used as a nested "field" in a FormCollection
 * @property {object} [initialValues = []] initial collection data to import
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
 * @property {object[]} [values] if you plan to manage storing form values, pass them in here.
 * Be sure you are passing in a store prop with setValue methods
 * @return {jsx} .form, though this class is frequently extended rather than
 * used directly and the render method is overriden
 */
export default class FormCollection extends Form {
  static defaultProps = {
    ...Form.defaultProps,
    defaultValues: {},
    initialValues: [],
    store: localStateStoreCollection,
  };

  /** @property {number} cid - client id, FormCollection managed index */
  cid = 0;
  collection = []; // used for refs

  constructor (...args) {
    super(...args);
    bindMethods(this);

    const errors = [];
    const values = this.store.getPersistentData()
      // unlikely, but prefilled collection data that is not yet persistent
      .concat(this.props.initialValues)
      .map(this.create);

    // init any lists per collection item
    values.forEach(() => {
      errors.push([]);
      this.fieldsBlurred.push([]);
    });

    this.store.initData(values);
    this.store.initErrors(errors);

    this.renderItem = curry(this.renderItem);
  }

  /**
   * _validate - get validation results
   * @return {array} [ boolean, object[] ]
   */
  _validate () {
    // 2d array of errors
    const errors = this.getData(true).map(data => validate(data, this.getValidations()));
    // if there are any, form is invalid
    const isValid = !errors.some(eArr => eArr.length > 0);

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

    return this.getErrors().map((errs, i) => (
      // keep the previous errors except for this field
      // add the errors for just this field
      i === index ? [ ...errs.filter(e => e.name !== name), ...fieldErrors ] : errs
    ));
  }

  handleClickAdd () {
    this.add()
      .then(this.onItemAdd)
      .then(() => {
        // attempt to focus on newly added item
        setTimeout(() => {
          const lastItem = this.collection[this.collection.length - 1];
          if (lastItem) callMe(lastItem.focus);
        }, 0);
      });
  }

  handleClickRemove (e) {
    const index = Number(e.target.value);
    const pred = (_, i) => i !== index;

    this.remove(index)
      .then(this.onItemRemove)
      // cleanup
      .then(() => {
        this.fieldsBlurred.filter(pred);
        this.store.setErrors(this.store.getErrors().filter(pred));
      });
  }

  onItemAdd () {
    this.pubsub.trigger('item.added');

    // publish a message for the entire form
    this._publishOnChange(this.formatData(this.getData()));
  }

  onItemRemove () {
    this.pubsub.trigger('item.removed');

    // publish a message for the entire form
    this._publishOnChange(this.formatData(this.getData()));
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

        this.pubsub.trigger('item.added');
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

  formatData (data) {
    return this.model.formatCollection(data
      // be sure all items have default values
      .map(item => ({ ...this.props.defaultValues, ...item }))
      // run field level hooks
      .map(item => super.formatData(item))
      // run model level hooks
      .map(this.model.formatModel)
    );
  }

  /**
   * @param   {object[]} storeErrors
   * @param   {object[]} propErrors
   * @return  {Error[]} collection of errors (name, error)
   */
  formatErrors (storeErrors, propErrors) {
    return storeErrors.map((errors, i) => errors
      .concat(propErrors[i] || [])
      .map(this._normalizeError)
      // filter out errors for fields that haven't been blurred yet
      .filter(e => this.shouldErrorDisplay(e, i))
    );
  }

  getCid () {
    return `c${this.cid++}`;
  }

  /**
   * getData - get data for external consumption, merges temporary data atop permanent data
   * @param {boolean} [withCid = false] omit cid attr by default, included when rendering internally
   * @return {object[]}
   */
  getData (withCid = false) {
    const list = [];
    const set = new Set();
    const { primaryKey } = this.model;

    // merge our edited data over the persistent data
    [ ...this.store.getPersistentData(), ...this.store.getData() ].forEach(a => {
      const key = a[primaryKey];

      // we already added a persistent item
      if (key && set.has(key)) {
        const i = list.findIndex(b => key === b[primaryKey]);
        list[i] = { ...list[i], ...a };
      }
      else {
        if (key) set.add(key);
        list.push(a);
      }
    });

    if (!list.length) return emptyValues;

    // by default, omit the cid for external consumers
    return withCid ? list : list.map(omit('cid'));
  }

  getItemProps (data) {
    return { data };
  }

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
      ? this.getData(true)[dataOrIndex]
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

    this.setData(this.store.getData(true).filter(obj => obj.cid !== cid));
  }

  renderItem (Component, item, index) {
    return <Component
      {...this.getItemProps(item)}
      handleClickRemove={this.handleClickRemove}
      index={index}
      key={item.cid}
      ref={el => el && this.collection.push(el)} />;
  }

  render (Component) {
    const formCollectionData = this.formatData(this.getData(true));
    Component = Component || this.props.component;
    const context = this.getContextValue(
      this.formatData(this.getData()),
      this.formatErrors(this.getErrors(), this.props.errors, this.fieldsBlurred, this.props.validateAsYouGo),
      this.state.isValid,
      this.props.validateAsYouGo,
      this.props.formName,
      this.pubsub,
      this.state.isLoading,
    );
    const itemRenderer = this.renderItem(Component);
    this.collection = [];

    return (
      <FormContext.Provider value={context}>
        {formCollectionData.map(itemRenderer)}
        {this.props.children}
      </FormContext.Provider>
    );
  }
}
