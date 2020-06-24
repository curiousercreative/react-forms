import React from 'react';

import Form from './Form.jsx';
import FormContext from './config/FormContext';
import localStateStoreCollection from '../lib/form/stores/localStateStoreCollection.js';

import bindMethods from '../util/bindMethods.js';
import callMe from '../util/callMe.js';
import curry from '../util/curry.js';
import fromEntries from '../util/fromEntries.js';
import omit from '../util/omit.js';
import { validate } from '../lib/validator';

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
    values: [],
  };

  /** @property {number} cid - client id, FormCollection managed index */
  cid = 0;
  collection = []; // used for refs
  emptyValues = [];

  constructor (...args) {
    super(...args);
    bindMethods(this);

    this._setStore(localStateStoreCollection, this.props.store);

    const errors = [];
    const values = this.store.getPersistentData()
      .map(this.create);

    // init any lists per collection item
    values.forEach(() => {
      this.fieldsBlurred.push([]);
    });

    this.store.initData(values);
    this.store.initErrors(errors);

    this.renderItem = curry(this.renderItem);
  }

  _callbackRef (refInstance) {
    this.collection.push(refInstance);
  }

  /**
   * _validate - get validation results
   * @return {array} [ boolean, object[] ]
   */
  _validate () {
    // arrayify to  FormCollection
    const errors = this.store.values().map(data => validate(data, this.getValidations()));
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
        this.store.setData(this.store.values().concat(object)),
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
      // run field level hooks
      .map(obj => fromEntries(Object.entries(obj)
        .map(([ name, val ]) => [ name, this.model.formatValue(name, val) ]))
      )
      // run model level hooks
      .map(this.model.formatModel)
    );
  }

  getCid () {
    return `c${this.cid++}`;
  }

  getData () {
    const list = [];
    const set = new Set();
    const { selectPrimaryKey } = this.model;

    this.store.getPersistentData().concat(this.store.values()).forEach(a => {
      const key = selectPrimaryKey(a);

      // we already added a persistent item
      if (key && set.has(key)) {
        const i = list.findIndex(b => key === selectPrimaryKey(b));
        list[i] = { ...list[i], ...a };
      }
      else {
        if (key) set.add(key);
        list.push(a);
      }
    });

    return this.parse(list);
  }

  getItemProps (data) {
    return { data };
  }

  parse (collection) {
    // by default, omit the cid for external consumers
    return collection.map(omit('cid'));
  }

  /**
   * remove - removes a temporary object or deletes a persistent object
   * @param  {object|number} dataOrIndex - the collection item to remove (or its index)
   * @param  {function} [isNew = defaultIsNew] Object => Boolean
   * @return {Promise}
   */
  remove (dataOrIndex, isNew = defaultIsNew) {
    const data = typeof dataOrIndex === 'number'
      ? this.store.values()[dataOrIndex]
      : dataOrIndex;

    // if object is new, just handle in state
    if (isNew(data)) {
      this.removeTemporaryItem(data);
      return Promise.resolve().then(this.onRemove);
    }

    // object isn't new, pass it to the prop function
    return this.props.delete(data)
      .then(() => this.removeTemporaryItem(data))
      .then(() => this.pubsub.trigger('item.removed'))
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

    this.setData(this.store.values().filter(obj => obj.cid !== cid));
  }

  renderItem (Component, item, index) {
    return <Component
      {...this.getItemProps(item)}
      handleClickRemove={this.handleClickRemove}
      index={index}
      key={item.cid}
      ref={this._callbackRef} />;
  }

  render (Component) {
    const formCollectionData = this.formatData(this.store.values());
    Component = Component || this.props.component;
    const itemRenderer = this.renderItem(Component);
    this.collection = [];

    return (
      <FormContext.Provider value={this.getContextValue(formCollectionData, this.getErrors())}>
        {formCollectionData.map(itemRenderer)}
      </FormContext.Provider>
    );
  }
}
