import { pascalize } from '../../transformers';

const emptyErrors = [];

/**
 * localStateStore
 * @param  {object} instance - Form component instance
 * @return {object}
 */
export default function localStateStore (instance) {
  /**
   * fromStore - transform data read from store, perhaps the store only accepts
   * strings or some other encoding requirement
   * @param {object|object[]} data
   * @return {object|object[]}
   */
  function fromStore (data) {
    return data;
  }

  function getData () {
    return this.values();
  }

  function getErrors () {
    return instance.state.errors;
  }

  function _getValue (name) {
    return this.values()[name];
  }

  function getValue (name, index) {
    const methodName = `getValueFor${pascalize(name)}`;
    // if we don't have a field specific getter, make one based on _getValue
    if (!this[methodName]) this[methodName] = this._getValue.bind(this, name);

    return this[methodName](index);
  }

  function initData (values) {
    // we only init data in state if we don't have a name
    if (!instance._hasParentForm()) {
      instance.state.values = this.toStore(values || instance.state.values || instance.emptyValues);
    }
  }

  function initErrors (errors) {
    instance.state.errors = errors || instance.state.errors || emptyErrors;
  }

  function _setData (values) {
    return this.setData(this.toStore(instance.model.cleanModel(values)));
  }

  function setData (values) {
    return instance._hasParentForm()
      ? instance.context.actions.setValue(instance.props.name, values, 'field', instance.props.index)
      : new Promise(resolve => instance.setState({ values }, resolve));
  }

  function setErrors (_errors) {
    const errors = _errors.length ? _errors : emptyErrors;

    return new Promise(resolve => instance.setState({ errors }, resolve));
  }

  function _setValue (name, value) {
    return this._setData({ ...this.values(), [name]: value });
  }

  function setValue (name, value, index) {
    const methodName = `setValueFor${pascalize(name)}`;
    // if we don't have a field specific setter, make one based on setValue
    if (!this[methodName]) this[methodName] = this._setValue.bind(this, name);

    return this[methodName](value, index);
  }

  /**
   * toStore - transform form data before writing to store
   * @param  {object|object[]} data
   * @return {object|object[]}
   */
  function toStore (data) {
    return data;
  }

  function _values () {
    const values = instance._hasParentForm()
      ? instance.context.state.values[instance.props.name]
      : instance.state.values;

    return values || instance.emptyValues;
  }

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
