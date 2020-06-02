/**
 * create a promise that resolves after provided amount of time has lapsed
 * @function timeoutPromise
 * @param  {number} ms - amount of time to wait (in milliseconds)
 * @return {promise}
 */
export default function timeoutPromise (ms=0) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
