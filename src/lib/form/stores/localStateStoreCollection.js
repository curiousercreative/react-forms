import omit from '../../../util/omit.js';

/**
 * localStateStoreCollection
 * @param  {object} instance - Form component instance
 * @return {object}
 */
export default function localStateStoreCollection (instance) {
  return {
    initData (values) {
      // we only init data in state if we don't have a name
      if (!instance._hasParentForm()) {
        instance.state.values = values || instance.state.values || [];
      }

      return Promise.resolve();
    },

    parseData (data) {
      return data.map(omit('cid'));
    },

    getPersistentData () {
      if (instance._hasParentForm()) {
        return instance.props.values || instance.context.state.values[instance.props.name];
      }

      return instance.props.values;
    },
  };
}
