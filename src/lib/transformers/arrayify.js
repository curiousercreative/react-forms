import exists from '../../util/exists.js';

/**
 * converts non-arrays into single item arrays if not already an array
 * @memberof module:lib/transformers
 * @param  {any} val
 * @return {array} original array or original value as the only item in an array
 */
export default function arrayify (val) {
  if (Array.isArray(val)) return val;

  return exists(val) ? [val] : [];
}
