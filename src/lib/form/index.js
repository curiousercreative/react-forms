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
 * mergeObjects - merge stores, models, etc
 * @param  {Form} instance
 * @param  {object[]} objects
 * @return {object}
 */
export function mergeObjects (instance, ...objects) {
  return bindMethods(objects.reduce((merged, obj) => Object.assign(merged, injectInstance(obj, instance)), {}));
}

/**
 * injectInstance - inject a Form instance into a model, store, etc
 * @param  {object} [obj={}]
 * @param  {Form} instance
 * @return {object}
 */
function injectInstance (obj = {}, instance) {
  return typeof obj === 'function' ? obj(instance) : obj;
}
