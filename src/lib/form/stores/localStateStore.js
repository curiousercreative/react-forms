import { pascalize } from '../../transformers';

const emptyErrors = [];

/**
 * localStateStore
 * @param  {object} instance - Form component instance
 * @return {object}
 */
export default function localStateStore (instance) {
  /**
   * clean - transform external data for store
   * @param {object|object[]} data
   * @return {object|object[]}
   */
  function clean (data) {
    return data;
  }

  function getData () {
    return this.parse(this.values());
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
      instance.state.values = this.clean(values || instance.state.values || instance.emptyValues);
    }
  }

  function initErrors (errors) {
    instance.state.errors = errors || instance.state.errors || emptyErrors;
  }

  /**
   * parse - transform form data before sending to external sources
   * @param  {object|object[]} data
   * @return {object|object[]}
   */
  function parse (data) {
    return data;
  }

  function setData (values) {
    return instance._hasParentForm()
      // TODO: should we be parsing when stored in parent form :/
      ? instance.context.actions.setValue(instance.props.name, this.parse(values), 'field', instance.props.index)
      : new Promise(resolve => instance.setState({ values }, resolve));
  }

  function setErrors (_errors) {
    const errors = _errors.length ? _errors : emptyErrors;

    return new Promise(resolve => instance.setState({ errors }, resolve));
  }

  function _setValue (name, value) {
    return this.setData({ ...this.values(), [name]: value });
  }

  function setValue (name, value, index) {
    const methodName = `setValueFor${pascalize(name)}`;
    // if we don't have a field specific setter, make one based on setValue
    if (!this[methodName]) this[methodName] = this._setValue.bind(this, name);

    return this[methodName](value, index);
  }

  function values () {
    const values = instance._hasParentForm()
      ? instance.context.state.values[instance.props.name]
      : instance.state.values;

    return values || instance.emptyValues;
  }

  return {
    _getValue,
    _setValue,
    clean,
    getData,
    getErrors,
    getValue,
    initData,
    initErrors,
    parse,
    setData,
    setErrors,
    setValue,
    values,
  };
}
