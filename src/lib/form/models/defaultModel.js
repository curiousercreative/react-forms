/**
 * localStateStore
 * @param  {object} instance - Form component instance
 * @return {object}
 */
export default function defaultModel (instance) {
  /**
   * clean - clean a full model instance, future use?
   * @param  {object} formData
   * @return {object}
   */
  function clean (formData) {
    return formData;
  }

  function cleanCollection (formData) {
    return formData;
  }

  /**
   * cleanValue - transform a single form field value from user input before storing
   * @param {string} name
   * @param {string|any} value
   * @return {string|any}
   */
  function cleanValue (name, value) {
    return value;
  }

  function getValidations () {
    return this.validations;
  }

  /**
   * format - prepare entire form data for form field view components
   * @param  {object} formData
   * @return {object}
   */
  function format (formData) {
    return formData;
  }

  function formatCollection (formData) {
    return formData;
  }

  /**
   * formatValue - transform a single field for view components
   * @param  {string} name
   * @param  {string|any} value
   * @return {string|any}
   */
  function formatValue (name, value) {
    return value;
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
    clean,
    cleanCollection,
    cleanValue,
    format,
    formatCollection,
    formatValue,
    getValidations,
    selectPrimaryKey,
    validations: [],
  };
}
