/** @module lib/form/stores/localStateStore */
import { pascalize } from '../../transformers';

const emptyErrors = [];
const emptyValues = {};

/**
 * @function localStateStore
 * @param  {object} instance - Form component instance
 * @return {FormStore}
 */
export default function localStateStore (instance) {
  /**
   * getData
   * @description retrieves full form data
   * @return      {object|object[]}
   */
  function getData () {
    const values = instance._hasParentForm()
      ? instance.context.form.getValue(instance.props.name, instance.props.index)
      : instance.props.values || instance.state.values;

    return values || emptyValues;
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
   * initData
   * @description write data to store during Form instance construction phase
   * this is necessary for React Components where writing to state must be done differently
   * before the component has been mounted
   * @param  {object} data - raw values that may be transformed for the store
   */
  function initData (data) {
    // we only init data in state if we don't have a name
    if (instance._hasParentForm()) {
      instance.context.actions.setValue(instance.props.name, data, 'field', instance.props.index);
    }
    else instance.state.values = data;
  }

  /**
   * initErrors
   * @description write errors to store during Form instance construction phase
   * @param  {object[]} errors
   */
  function initErrors (errors) {
    instance.state.errors = errors || emptyErrors;
  }

  /**
   * _setData
   * @description wrapper for providing the store with complete data. this method
   * currently assumes data is user entered
   * @param {object} data - raw values that may be cleaned by model before
   * being transformed for store
   * @return {Promise}
   */
  function _setData (data) {
    return this.setData(instance.model.cleanModel(data));
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
    return this._setData({ ...this.getData(), [name]: value });
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

  return {
    _setData,
    _setValue,
    getData,
    getErrors,
    initData,
    initErrors,
    setData,
    setErrors,
    setValue,
  };
}
