import rethrow from './rethrow.js';
import tap from './tap.js';

/**
 * always - generates resolve and reject handlers to be spread into a Promise.then
 * NOTE: this util function mocks the behavior of too new to use Promise.finally (without monkey patch and with the ability to easily swallor errors):
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/finally
 * @param  {function} fn - function to be used as both resolve and reject handlers
 * @param  {boolean}  [swallowError=false] - should we rethrow the error so we don't
 * continue down the promise resolution chain?
 * @return {function[]} array of two functions
 * @example
 * Promise.resolve()
 *  .then(...always(() => dispatch(clearLoader())));
 */
export default function always (fn, swallowError = false) {
  // tap so that the resolved value can propogate down the resolve chain
  const onResolve = tap(fn);
  // check whether we want to rethrow the error if the promise was rejected
  const onReject = swallowError ? fn : rethrow(fn);

  return [ onResolve, onReject ];
}
