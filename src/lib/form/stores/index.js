/**
 * @typedef FormStore
 * @type {object}
 * @description Form store definition, see ./localStateStore.js
 * @property {_getValue} _getValue generic value getter describing how any value should be retrieved
 * @property {_setData} _setData wrapper for providing the store with complete data. this method
 * currently assumes data is user entered
 * @property {_setValue} _setValue
 * @property {_values} _values
 * @property {fromStore} fromStore transform data read from store, perhaps the store only accepts
 * strings or some other encoding requirement
 * @property {getData} getData read values from store
 * @property {getErrors} getErrors read errors from store
 * @property {getValue} getValue value getter wrapping function, determines which field specific
 * getter to use and call
 * @property {initData} initData write data to store during Form instance construction phase
 * this is necessary for React Components where writing to state must be done differently
 * before the component has been mounted
 * @property {initErrors} initErrors write errors to store during Form instance construction phase
 * @property {setData} setData writes entire data to Form state or parent Form state
 * @property {setErrors} setErrors
 * @property {setValue} setValue
 * @property {toStore} toStore
 * @property {values} values
 */

/**
  * @callback fromStore
  * @description transform data read from store, perhaps the store only accepts
  * strings or some other encoding requirement
  * @param {object|object[]} data
  * @return {object|object[]}
  */
/**
  * @callback getData
  * @description read values from store
  * @return {object}
  */
/**
  * @callback getErrors
  * @description read errors from store
  * @return {object[]}
  */
/**
  * @callback _getValue
  * @description generic value getter describing how any value should be retrieved
  * @param  {string} name
  * @return {any}
  */
/**
  * @callback getValue
  * @description value getter wrapping function, determines which field specific
  * getter to use and call
  * @param  {string} name
  * @param  {number} [index]
  * @return {any}
  */
/**
  * @callback initData
  * @description write data to store during Form instance construction phase
  * this is necessary for React Components where writing to state must be done differently
  * before the component has been mounted
  * @param  {object} _values - raw values that may be transformed for the store
  */
/**
  * @callback initErrors
  * @description write errors to store during Form instance construction phase
  * @param  {object[]} errors
  */
/**
  * @callback _setData
  * @description wrapper for providing the store with complete data. this method
  * currently assumes data is user entered
  * @param       {object} _values - raw values that may be cleaned by model before
  * being transformed for store
  * @return {Promise}
  */
/**
  * @callback setData
  * @description writes entire data to Form state or parent Form state
  * @param       {object} values
  * @return {Promise}
  */
/**
  * @callback setErrors
  * @description write errors to state
  * @param       {object[]} _errors
  * @return {Promise}
  */
/**
  * @callback _setValue
  * @description generic value setter describing how any value should be set
  * @param  {string} name
  * @param  {any} value
  * @return {Promise}
  */
/**
  * @callback setValue
  * @description value setter wrapping function, determines which field specific
  * setter to use and call it
  * @param  {string} name
  * @param  {any} value
  * @param  {number} [index]
  * @return {Promise}
  */
/**
  * @callback toStore
  * @description transform form data before writing to store, currently a placeholder
  * @param  {object|object[]} data
  * @return {object|object[]}
  */
/**
  * @callback _values
  * @description retrieves full data from Form state or parent Form state
  * @return      {object|object[]}
  */
/**
  * @callback values
  * @description wrapper function for transforming store data for view or app consumption
  * @return {object|object[]}
  */
