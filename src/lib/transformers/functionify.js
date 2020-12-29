/**
 * converts non-functions into functions returning arg if not already a function
 * @memberof module:lib/transformers
 * @param  {any} val
 * @return {array} original function or function returing original value
 */
export default function functionify (val) {
  return typeof val === 'function'
    ? val
    : () => val;
}
