import curry from './curry.js';
import { arrayify } from '../lib/transformers';
import fromEntries from './fromEntries.js';

/**
 * curried replacement for lodash.omit (not the same signature though)
 * @param  {string|array} key - what to copy from source obj
 * @param  {object} src - source object to pick values from
 * @return {object}
 */
export default curry(function omit (keys, src) {
  keys = arrayify(keys);

  return fromEntries(
    Object
      .entries(src)
      // filter out blacklisted keys
      .filter(([ key ]) => !keys.includes(key))
  );
});
