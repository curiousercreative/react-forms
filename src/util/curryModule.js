import curry from './curry.js';

function isFunction (fn) {
  return typeof fn === 'function';
}

/**
 * curry all functions within an imported module and pass through the rest
 * @function curryModule
 * @param  {any} module - a javascript module object, array, function, whatever
 * @return {any} same types as input, module is passed through with functions replaced
 * with curried versions
 */
export default function curryModule (module) {
  switch (typeof module) {
    case 'function':
      return curry(module);
    case 'object':
      return {
        ...module,
        ...Object
          .keys(module)
          .filter(key => isFunction(module[key]))
          .reduce((obj, key) => ({ ...obj, [key]: curry(module[key]) }), {}),
      };
  }

  if (Array.isArray(module)) {
    return module.map(any => isFunction(any) ? curry(any) : any);
  }

  return module;
}
