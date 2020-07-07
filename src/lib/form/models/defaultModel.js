/** @module lib/form/models/defaultModel */
import { pascalize } from '../../transformers';

/**
 * @function defaultModel
 * @param  {object} instance - Form component instance
 * @return {FormModel}
 */
export default function defaultModel (instance) {
  /**
   * cleanCollection
   * @description transform an entire collection before storing
   * @param {object[]} formData
   * @return {object[]}
   */
  function cleanCollection (formData) {
    return formData.map(this.cleanModel);
  }

  /**
   * cleanModel
   * @description transform an entire model before storing
   * @param  {object} formData
   * @return {object}
   */
  function cleanModel (formData) {
    return formData;
  }

  /**
   * _cleanValue
   * @description generic transform for any single form field value from user input before storing
   * @param {string} name
   * @param {string|any} value
   * @return {string|any}
   */
  function _cleanValue (name, value) {
    return value;
  }

  /**
   * cleanValue
   * @description wrapper for transforming user input values on their way to store
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

  /**
   * getValidations
   * @return {object[]} validations
   */
  function getValidations () {
    return this.validations;
  }

  /**
   * formatCollection
   * @description transform entire collection of data for view consumption
   * @param  {object[]} formData
   * @return {object[]}
   */
  function formatCollection (formData) {
    return formData;
  }

  /**
   * formatModel
   * @description prepare entire form data for form field view components
   * @param  {object} formData
   * @return {object}
   */
  function formatModel (formData) {
    return formData;
  }

  /**
   * _formatValue
   * @description generic transform for any single field for view components
   * @param  {string} name
   * @param  {string|any} value
   * @return {string|any}
   */
  function _formatValue (name, value) {
    return value;
  }

  /**
   * formatValue
   * @description wrapper for transforming form values for use by view components
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
   * @description selector function for identifying data, helpful for merging
   * temporary and persistent data
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
