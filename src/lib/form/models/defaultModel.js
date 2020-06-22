import { pascalize } from '../../transformers';

/**
 * localStateStore
 * @param  {object} instance - Form component instance
 * @return {object}
 */
export default function defaultModel (instance) {
  function cleanCollection (formData) {
    return formData.map(this.cleanModel);
  }

  /**
   * cleanModel - clean a full model instance before writing to st
   * @param  {object} formData
   * @return {object}
   */
  function cleanModel (formData) {
    return formData;
  }

  /**
   * _cleanValue - transform a single form field value from user input before storing
   * @param {string} name
   * @param {string|any} value
   * @return {string|any}
   */
  function _cleanValue (name, value) {
    return value;
  }

  /**
   * cleanValue - wrapper for transforming user input values on their way to store
   * @param {string} name
   * @param {string|any} value
   * @return {string|any}
   */
  function cleanValue (name, value) {
    const methodName = `cleanValueFor${pascalize(name)}`;
    // if we don't have a field specific cleaner, make one based on cleanValue
    if (!this[methodName]) this[methodName] = this._cleanValue.bind(this, name);

    return this[methodName](value);
  }

  function getValidations () {
    return this.validations;
  }

  function formatCollection (formData) {
    return formData;
  }

  /**
   * formatModel - prepare entire form data for form field view components
   * @param  {object} formData
   * @return {object}
   */
  function formatModel (formData) {
    return formData;
  }

  /**
   * formatValue - transform a single field for view components
   * @param  {string} name
   * @param  {string|any} value
   * @return {string|any}
   */
  function _formatValue (name, value) {
    return value;
  }

  /**
   * formatValue - wrapper for transforming form values for use by view components
   * @param {string} name
   * @param {string|any} value
   * @return {string|any}
   */
  function formatValue (name, value) {
    const methodName = `formatValueFor${pascalize(name)}`;
    // if we don't have a field specific cleaner, make one based on cleanValue
    if (!this[methodName]) this[methodName] = this._formatValue.bind(this, name);

    return this[methodName](value);
  }

  /**
   * selectPrimaryKey
   * @param  {object} modelInstance
   * @return {string|number|any} primary key
   */
  function selectPrimaryKey (modelInstance) {
    return modelInstance.id;
  }

  return {
    _cleanValue,
    _formatValue,
    cleanCollection,
    cleanModel,
    cleanValue,
    formatCollection,
    formatModel,
    formatValue,
    getValidations,
    selectPrimaryKey,
    validations: [],
  };
}
