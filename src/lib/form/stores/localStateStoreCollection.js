/** @module lib/form/stores/localStateStoreCollection */
import exists from '../../../util/exists.js';

const emptyErrors = [];
/**
 * @function localStateStoreCollection
 * @param  {object} instance - Form component instance
 * @return {FormStore}
 */
export default function localStateStoreCollection (instance) {
  return {
    /**
     * @function _getValue
     * @description generic value getter describing how any value should be retrieved
     * @param  {string} name
     * @param  {number} index
     * @return {any}
     */
    _getValue (name, index) {
      return this.values()[index][name];
    },

    /**
     * @function _setData
     * @description wrapper for providing the store with complete data. this method
     * currently assumes data is user entered
     * @param       {object} _values - raw values that may be cleaned by model before
     * being transformed for store
     * @return {Promise}
     */
    _setData (_values) {
      return this.setData(this.toStore(instance.model.cleanCollection(_values)));
    },

    /**
     * @function _setValue
     * @description generic value setter describing how any value should be set
     * @param  {string} name
     * @param  {any} value
     * @param  {number} index
     * @return {Promise}
     */
    _setValue (name, value, index) {
      // don't touch any values except for index requested
      return this._setData(this.values().map((v, i) => (
        i === index
          ? { ...v, [name]: value }
          : v
      )));
    },

    /**
     * @function getErrors
     * @description read errors from store, optionally for a specific collection item
     * @param  {number} [index]
     * @return {object[]}
     */
    getErrors (index) {
      const errors = exists(index)
        ? instance.state.errors[index]
        : instance.state.errors;

      return errors.length ? errors : emptyErrors;
    },

    /**
     * @function getPersistentData
     * @description read persistent data
     * @return {object[]}
     */
    getPersistentData () {
      // TODO: how to manage incoming updates to persistent data?
      return instance.props.values;
    },
  };
}
