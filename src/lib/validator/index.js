/** @module lib/validator */
import { arrayify, functionify } from '../transformers';
import uniq from '../../util/uniq.js';
import curryModule from '../../util/curryModule.js';

// import uncurried tests and message generators, curry them and export them
// we'll also export these curried functions within default at the bottom
import * as uncurriedTests from './tests';
import * as uncurriedMessages from './messages';
const messages = curryModule(uncurriedMessages);
const tests = curryModule(uncurriedTests);
export { messages, tests };

const DEFAULT_TEST_META = {
  formTest: false,
  warning: false,
};

/**
 * validations definition collection
 * @typedef {object[]} Validations
 * @property {array} Validations[].names - names of fields to perform validation on
 * @property {entries} Validations[].tests - first item in tuple is a test function,
 * second is message generator
 * @example
 * [{
 *   names: ['password'],
 *   tests: [
 *     [tests.required, messages.required],
 *   ],
 * }]
 */

/**
  * errors collection
  * @typedef {object[]} Errors
  * @property {string} Errors[].name - names of field error is for
  * @property {string} Errors[].error - error message
  * @example
  * [{ name: 'first_name', error: 'First name is required' }]
  */

/**
 * performs validations and returns errors
 * @function
 * @param {object} data - dictionary structure, typically form values
 * @param  {Validations} validations
 * @param  {boolean} [validateMissingFields = true]
 * @return {Errors} errors collection {@link Errors}
 */
export function validate (data, validations, validateMissingFields = true) {
  if (!validations.every(v => v.tests.every(Array.isArray))) {
    console.error('Validations data structure is incorrect. Each validation.tests should be an array of arrays');
  }

  // run all validations and aggregate the errors
  const errors = validations.reduce((_errors, { names, tests }) => {
    // arrayify if a string was provided and then ensure our array contains no dupes
    const errors = uniq(arrayify(names))
      // // don't validate fields that already have an error
      // .filter(name => !errorCollection.find(e => e.name === name))
      // map to error collections
      .map(name => {
        // exit early if this field wasn't provided and flag is set
        if (!validateMissingFields && !data.hasOwnProperty(name)) return [];

        return tests
          // functionify each validation test and message generator in case fully applied
          .map(([ test, message, meta ]) => [ functionify(test), functionify(message), meta ])
          // run all the tests for this field
          .map(([ testFn, messageFn, _meta ]) => {
            const meta = { ...DEFAULT_TEST_META, ..._meta };
            const isValid = testFn(meta.formTest ? data : data[name]);

            return [ !isValid && messageFn(name), meta ];
          })
          // filter out empty items (passed tests)
          .filter(([ v ]) => !!v && String(v).length > 0)
          // format as an error object
          .map(([ message, meta ]) => ({ meta, name, message }));
      })
      // flatten error collections
      .reduce((errorAgg, errors) => errorAgg.concat(errors), []);

    // merge with the running error collection for all validations
    _errors.push(...errors);
    return _errors;
  }, []);

  // ensure no field has more than one error
  return uniq(errors, a => a.name)
    // sort for predictable ordering of field errors
    .sort((a, b) => a.name > b.name ? 1 : -1);
}

export default { messages, tests, validate };
