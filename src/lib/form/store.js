
export function mergeStores (instance, ...stores) {
  return stores.reduce((merged, store) => Object.assign(merged, makeStore(store, instance)), {});
}

function makeStore (_store = {}, instance) {
  return typeof _store === 'function' ? _store(instance) : _store;
}
