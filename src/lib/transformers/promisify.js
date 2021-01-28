/**
 * converts non-promises into promises resolving with arg if not already a promise
 * @memberof module:lib/transformers
 * @param  {any} val
 * @return {array} original promise or promise resolving original value
 */
export default function promisify (val) {
  return typeof val instanceof Promise
    ? val
    : Promise.resolve(val);
}
