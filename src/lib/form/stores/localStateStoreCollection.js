/** @module lib/form/stores/localStateStoreCollection */
import exists from '../../../util/exists.js';

const emptyErrors = [];
const emptyValues = [];

/**
 * @function localStateStoreCollection
 * @param  {object} instance - Form component instance
 * @return {FormStore}
 */
export default function localStateStoreCollection (instance) {
  return {
    /**
     * @function _setData
     * @description wrapper for providing the store with complete data. this method
     * currently assumes data is user entered
     * @param       {object} data - raw values that may be cleaned by model before
     * being transformed for store
     * @return {Promise}
     */
    _setData (data) {
      return this.setData(instance.model.cleanCollection(data));
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
      return this._setData(this.getData().map((v, i) => (
        i === index
          ? { ...v, [name]: value }
          : v
      )));
    },

    /**
     * getData
     * @description retrieves edited form data
     * @return      {object[]}
     */
    getData () {
      // get our collection data that we control
      const values = instance._hasParentForm()
        ? instance.context.form.getValue(instance.props.name, instance.props.index)
        : instance.state.values;

      return values.length ? values : emptyValues;
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
      return instance.props.values || emptyValues;
    },
  };
}
