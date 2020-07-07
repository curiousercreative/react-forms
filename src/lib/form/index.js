/** @module lib/form */

/**
 * @function bindMethods
 * @param  {object} source
 * @return {object} a new object with methods bound
 */
function bindMethods (source) {
  const destination = {};

  Object.entries(source)
    .forEach(([ key, val ]) => {
      destination[key] = typeof val === 'function'
        ? val.bind(destination)
        : val;
    });

  return destination;
}

/**
 * @function mergeObjects
 * @param  {Form} instance
 * @param  {object[]} objects - for merging
 * @return {object} merged
 */
export function mergeObjects (instance, ...objects) {
  return bindMethods(objects.reduce((merged, obj) => Object.assign(merged, injectInstance(obj, instance)), {}));
}

/**
 * @function injectInstance
 * @param  {object} [obj={}] models, stores, etc for injecting a Form instance into
 * @param  {Form} instance Form instance
 * @return {object}
 */
function injectInstance (obj = {}, instance) {
  return typeof obj === 'function' ? obj(instance) : obj;
}
