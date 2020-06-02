/** @module lib/validator/tests */
import exists from '../../util/exists.js';

// Regex taken from https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/email#Basic_validation
// const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
// Regex modified from the above to require a TLD of at least two characters
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])$/;

// NOTE: all test functions must return a boolean
// NOTE: all test functions here will receive a single argument when called from validator.validate: the value of the field.
// If the test function needs additional arguments (such as minLength) it should make use
// of currying and those additional arguments should be supplied in the form validations definition
// In all cases, the value argument will always be the last one supplied

/**
 * @function
 * @param  {any} value
 * @return {boolean}
 */
export function email (value) {
  return passIfEmpty(value, value => !!String(value).match(EMAIL_REGEX));
}

/**
 * checks length property
 * @function
 * @param  {number} length - maximum length (inclusive)
 * @param  {array|string} value - if not an array, will be type cast as string
 * @return {boolean}
 * @example 'hi', 3 => true
 * @example 'hello', 3 => false
 */
export function maxLength (length, value) {
  const val = Array.isArray(value) ? value : String(value);

  return val.length <= length;
}

/**
 * checks length property
 * @function
 * @param  {number} length - minimum length (inclusive)
 * @param  {array|string} value - if not an array, will be type cast as string
 * @return {boolean}
 * @example 'hi', 2 => true
 * @example [], 2 => false
 */
export function minLength (length, value) {
  const val = Array.isArray(value) ? value : String(value);

  return val.length >= length;
}

/**
 * @function
 * @param  {any} value
 * @return {boolean}
 */
export function phone (value) {
  return passIfEmpty(value, value => {
    const val = String(value);

    // relaxed pattern allows for "ext" or "x" to come after a loose phone pattern
    return !!val.match(/^\+?[0-9-()\s]{10,}.*[0-9]?$/)
      // must contain at least 10 digits (should cover US without country code as well as international)
      && minLength(10, val.replace(/[^0-9]/g, ''));
  });
}

/**
 * @function
 * @param  {any} value
 * @return {boolean}
 */
export function integer (value) {
  return passIfEmpty(value, value => !!String(value).match(/^[0-9]+$/));
}

/**
 * ensures that a value has been entered/set
 * @function
 * @param  {any} value - strings must be minLength of 1, other types must be defined & not null
 * @return {boolean}
 * @example 'hi' => true
 * @example 0 => true
 * @example [] => true
 * @example false => true
 * @example null => false
 * @example undefined => false
 * @example '' => false
 */
export function required (value) {
  return typeof value === 'string' ? minLength(1, value) : exists(value);
}

/**
 * utility function to prevent format validators from failing on
 * when nothing was input
 * @function
 * @param  {string|var} value - typically a string, but could be anything
 * @param  {function} test - test function to call and return value of if not empty
 * @return {boolean}
 */
function passIfEmpty (value, test) {
  return !exists(value) || !value.length || test(value);
}
