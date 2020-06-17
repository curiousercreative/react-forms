/**
 * mergeObjects - merge stores, models, etc
 * @param  {Form} instance
 * @param  {object[]} objects
 * @return {object}
 */
export function mergeObjects (instance, ...objects) {
  return objects.reduce((merged, obj) => Object.assign(merged, injectInstance(obj, instance)), {});
}

/**
 * injectInstance - inject a Form instance into a model, store, etc
 * @param  {object} [_obj={}]
 * @param  {Form} instance
 * @return {object}
 */
function injectInstance (_obj = {}, instance) {
  return typeof _obj === 'function' ? _obj(instance) : _obj;
}
