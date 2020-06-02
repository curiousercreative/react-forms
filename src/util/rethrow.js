import callMe from './callMe.js';

/**
 * Intended to used as a Promise rejection handler, passes a rejection reason (error)
 * to the supplied onRejection function and then throw the same error again
 *
 * @param  {function} onRejection
 * @return {function}
 */
export default function rethrow (onRejection) {
  return error => {
    callMe(onRejection, { args: [ error ] });
    throw error;
  };
}
