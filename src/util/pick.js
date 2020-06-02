import curry from './curry.js';
import exists from './exists.js';
import { arrayify } from '../lib/transformers';

/**
 * curried replacement for lodash.pick (not the same signature though)
 * @param  {string|array} key - what to copy from source obj
 * @param  {object} src - source object to pick values from
 * @return {object}
 */
export default curry(function pick (keys, src) {
  keys = arrayify(keys);

  return keys.reduce((dest, key) => {
    const val = src[key];

    // only pick a value if it's not null/undefined
    return exists(val) ? { ...dest, [key]: val } : dest;
  }, {});
});
