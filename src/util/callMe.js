/**
 * callMe - safely run a function that may or may not exist
 * @param  {function} [fn] - the function in question
 * @param {any} [defaultReturnValue] - if function doesn't exist, return this value
 * @param  {array} [args] - arguments to supply to the function
 * @return {any} whatever function returns or defaultReturnValue if supplied
 */
export default function callMe (fn, { defaultReturnValue, args = [] } = {}) {
  if (typeof fn === 'function') {
    try {
      return fn(...args);
    }
    catch (e) { console.error(e); }
  }

  return defaultReturnValue;
}
