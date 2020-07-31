/** @module lib/form/stores/localStateStore */
import { pascalize } from '../../transformers';

const emptyErrors = [];

/**
 * @function localStateStore
 * @param  {object} instance - Form component instance
 * @return {FormStore}
 */
export default function localStateStore (instance) {
  /**
   * fromStore
   * @description transform data read from store, perhaps the store only accepts
   * strings or some other encoding requirement
   * @param {object|object[]} data
   * @return {object|object[]}
   */
  function fromStore (data) {
    return data;
  }

  /**
   * getData
   * @description read values from store
   * @return {object}
   */
  function getData () {
    return this.values();
  }

  /**
   * getErrors
   * @description read errors from store
   * @return {object[]}
   */
  function getErrors () {
    return instance.state.errors;
  }

  /**
   * _getValue
   * @description generic value getter describing how any value should be retrieved
   * @param  {string} name
   * @return {any}
   */
  function _getValue (name) {
    return this.values()[name];
  }

  /**
   * getValue
   * @description value getter wrapping function, determines which field specific
   * getter to use and call
   * @param  {string} name
   * @param  {number} [index]
   * @return {any}
   */
  function getValue (name, index) {
    const methodName = `getValueFor${pascalize(name)}`;
    // if we don't have a field specific getter, make one based on _getValue
    if (!this[methodName]) this[methodName] = this._getValue.bind(this, name);

    return this[methodName](index);
  }

  /**
   * initData
   * @description write data to store during Form instance construction phase
   * this is necessary for React Components where writing to state must be done differently
   * before the component has been mounted
   * @param  {object} _values - raw values that may be transformed for the store
   */
  function initData (_values) {
    const values = this.toStore(_values || instance.state.values || instance.emptyValues);

    // we only init data in state if we don't have a name
    if (instance._hasParentForm()) {
      instance.context.actions.setValue(instance.props.name, values, 'field', instance.props.index);
    }
    else instance.state.values = this.toStore(values);
  }

  /**
   * initErrors
   * @description write errors to store during Form instance construction phase
   * @param  {object[]} errors
   */
  function initErrors (errors) {
    instance.state.errors = errors || instance.state.errors || emptyErrors;
  }

  /**
   * _setData
   * @description wrapper for providing the store with complete data. this method
   * currently assumes data is user entered
   * @param       {object} _values - raw values that may be cleaned by model before
   * being transformed for store
   * @return {Promise}
   */
  function _setData (_values) {
    return this.setData(this.toStore(instance.model.cleanModel(_values)));
  }

  /**
   * setData
   * @description writes entire data to Form state or parent Form state
   * @param       {object} values
   * @return {Promise}
   */
  function setData (values) {
    return instance._hasParentForm()
      ? instance.context.form.setValue(instance.props.name, values, 'field', instance.props.index)
      : new Promise(resolve => instance.setState({ values }, resolve));
  }

  /**
   * setErrors
   * @description write errors to state
   * @param       {object[]} _errors
   * @return {Promise}
   */
  function setErrors (_errors) {
    const errors = _errors.length ? _errors : emptyErrors;

    // no need to set state if no change
    return instance.state.errors === errors
      ? Promise.resolve()
      : new Promise(resolve => instance.setState({ errors }, resolve));
  }

  /**
   * _setValue
   * @description generic value setter describing how any value should be set
   * @param  {string} name
   * @param  {any} value
   * @return {Promise}
   */
  function _setValue (name, value) {
    return this._setData({ ...this.values(), [name]: value });
  }

  /**
   * setValue
   * @description value setter wrapping function, determines which field specific
   * setter to use and call it
   * @param  {string} name
   * @param  {any} value
   * @param  {number} [index]
   * @return {Promise}
   */
  function setValue (name, value, index) {
    const methodName = `setValueFor${pascalize(name)}`;
    // if we don't have a field specific setter, make one based on setValue
    if (!this[methodName]) this[methodName] = this._setValue.bind(this, name);

    return this[methodName](value, index);
  }

  /**
   * toStore
   * @description transform form data before writing to store, currently a placeholder
   * @param  {object|object[]} data
   * @return {object|object[]}
   */
  function toStore (data) {
    return data;
  }

  /**
   * _values
   * @description retrieves full data from Form state or parent Form state
   * @return      {object|object[]}
   */
  function _values () {
    const values = instance._hasParentForm()
      ? instance.context.form.getValue(instance.props.name, instance.props.index)
      : instance.state.values;

    return values || instance.emptyValues;
  }

  /**
   * values
   * @description wrapper function for transforming store data for view or app consumption
   * @return {object|object[]}
   */
  function values () {
    // TODO: consider moving this fromStore to Form.formatData to improve memoization
    return this.fromStore(_values());
  }

  return {
    _getValue,
    _setData,
    _setValue,
    _values,
    fromStore,
    getData,
    getErrors,
    getValue,
    initData,
    initErrors,
    setData,
    setErrors,
    setValue,
    toStore,
    values,
  };
}
