const emptyErrors = [];

/**
 * localStateStore
 * @param  {object} instance - Form component instance
 * @return {object}
 */
export default function localStateStore (instance) {
  return {
    cleanData (data) {
      return data;
    },

    getData () {
      return instance._hasParentForm()
        ? this.cleanData(instance.context.state.values[instance.props.name])
        : instance.state.values;
    },

    initData (values) {
      instance.state = instance.state || {};

      // we only init data in state if we don't have a name
      if (!instance._hasParentForm()) {
        instance.state.values = values || instance.state.values || {};
      }

      return Promise.resolve();
    },

    parseData (data) {
      return data;
    },

    setData (values) {
      return instance._hasParentForm()
        ? instance.context.actions.setValue(instance.props.name, this.parseData(values), 'field')
        : new Promise(resolve => instance.setState({ values }, resolve));
    },

    getErrors () {
      return instance.state.errors;
    },

    initErrors (errors) {
      instance.state = instance.state || {};
      instance.state.errors = errors || instance.state.errors || [];

      return Promise.resolve();
    },

    setErrors (_errors) {
      const errors = _errors.length ? _errors : emptyErrors;

      return new Promise(resolve => instance.setState({ errors }, resolve));
    },
  };
}
