import isJsx from '../util/isJsx.js';

export default class Error {
  static normalize (error) {
    switch (typeof error) {
      case 'object':
        // convert entries to objects
        if (Array.isArray(error) && error.length) {
          return { name: error[0], error: error[1] };
        }
        // convert Errors to strings
        if ('message' in error) {
          return { error: error.message };
        }
        // properly formatted as is
        if ('error' in error) return error;
      default: // eslint-disable-line no-fallthrough
        return { error: isJsx(error) ? error : error.toString() };
    }
  }
}
