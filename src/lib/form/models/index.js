/**
 * @typedef FormModel
 * @type {object}
 * @description Form store definition, see ./localStateStore.js
 * @property {_cleanValue} _cleanValue
 * @property {_formatValue} _formatValue
 * @property {cleanCollection} cleanCollection
 * @property {cleanModel} cleanModel
 * @property {cleanValue} cleanValue
 * @property {formatCollection} formatCollection
 * @property {formatModel} formatModel
 * @property {formatValue} formatValue
 * @property {getValidations} getValidations
 * @property {selectPrimaryKey} selectPrimaryKey
 */

/**
  * @callback cleanCollection
  * @description transform an entire collection before storing
  * @param {object[]} formData
  * @return {object[]}
  */

/**
  * @callback cleanModel
  * @description transform an entire model before storing
  * @param  {object} formData
  * @return {object}
  */

/**
  * @callback _cleanValue
  * @description generic transform for any single form field value from user input before storing
  * @param {string} name
  * @param {string|any} value
  * @return {string|any}
  */

/**
  * @callback cleanValue
  * @description wrapper for transforming user input values on their way to store
  * @param {string} name
  * @param {string|any} value
  * @return {string|any}
  */

/**
  * @callback getValidations
  * @return {object[]} validations
  */

/**
  * @callback formatCollection
  * @description transform entire collection of data for view consumption
  * @param  {object[]} formData
  * @return {object[]}
  */

/**
  * @callback formatModel
  * @description prepare entire form data for form field view components
  * @param  {object} formData
  * @return {object}
  */

/**
  * @callback _formatValue
  * @description generic transform for any single field for view components
  * @param  {string} name
  * @param  {string|any} value
  * @return {string|any}
  */

/**
  * @callback formatValue
  * @description wrapper for transforming form values for use by view components
  * @param {string} name
  * @param {string|any} value
  * @return {string|any}
  */

/**
  * @callback selectPrimaryKey
  * @description selector function for identifying data, helpful for merging
  * temporary and persistent data
  * @param  {object} modelInstance
  * @return {string|number|any} primary key
  */
