import exists from '../../../util/exists.js';

const emptyErrors = [];
/**
 * localStateStoreCollection
 * @param  {object} instance - Form component instance
 * @return {object}
 */
export default function localStateStoreCollection (instance) {
  return {
    _getValue (name, index) {
      return this.values()[index][name];
    },

    _setValue (name, value, index) {
      // don't touch any values except for index requested
      return this._setData(this.values().map((v, i) => (
        i === index
          ? { ...v, [name]: value }
          : v
      )));
    },

    getErrors (index) {
      const errors = exists(index)
        ? instance.state.errors[index]
        : instance.state.errors;

      return errors.length ? errors : emptyErrors;
    },

    // TODO: how to manage incoming updates to persistent data?
    getPersistentData () {
      return instance.props.values;
    },
  };
}
