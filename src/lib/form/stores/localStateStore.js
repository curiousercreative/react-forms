import exists from '../../../util/exists.js';
import { pascalize } from '../../transformers';
const emptyErrors = [];

/**
 * clean - transform external data for store
 * @param {object|object[]} data
 * @return {object|object[]}
 */
function clean (data) {
  return data;
}

/**
 * parse - transform form data before sending to external sources
 * @param  {object|object[]} data
 * @return {object|object[]}
 */
function parse (data) {
  return data;
}

/**
 * localStateStore
 * @param  {object} instance - Form component instance
 * @return {object}
 */
export default function localStateStore (instance) {
  function getData () {
    return parse(values());
  }

  function getErrors () {
    return instance.state.errors;
  }

  function _getValue (name, index) {
    return exists(index) ? values()[index][name] : values()[name];
  }

  function getValue (name, index) {
    const methodName = `getValueFor${pascalize(name)}`;
    // if we don't have a field specific getter, make one based on _getValue
    if (!this[methodName]) this[methodName] = _getValue.bind(this, name);

    return this[methodName](index);
  }

  function initData (values) {
    // we only init data in state if we don't have a name
    if (!instance._hasParentForm()) {
      instance.state.values = clean(values || instance.state.values || {});
    }
  }

  function initErrors (errors) {
    instance.state.errors = errors || instance.state.errors || [];
  }

  function setData (values) {
    return instance._hasParentForm()
      ? instance.context.actions.setValue(instance.props.name, parse(values), 'field')
      : new Promise(resolve => instance.setState({ values }, resolve));
  }

  function setErrors (_errors) {
    const errors = _errors.length ? _errors : emptyErrors;

    return new Promise(resolve => instance.setState({ errors }, resolve));
  }

  function _setValue (name, value, index) {
    return setData({ ...values(), [name]: value });
  }

  function setValue (name, value, index) {
    const methodName = `setValueFor${pascalize(name)}`;
    // if we don't have a field specific setter, make one based on setValue
    if (!this[methodName]) this[methodName] = _setValue.bind(this, name);

    return this[methodName](value, index);
  }

  function values () {
    return instance._hasParentForm()
      ? instance.context.state.values[instance.props.name]
      : instance.state.values;
  }

  return {
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
    // TODO: why won't this work as a getter ?
    // get values () {
    //   return instance._hasParentForm()
    //     ? instance.context.state.values[instance.props.name]
    //     : instance.state.values;
    // }
  };
}
