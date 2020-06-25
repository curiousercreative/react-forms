/** @module lib/validator/messages */
import { humanize } from '../transformers';

// NOTE: all message generator functions must return a string
// NOTE: all message generator functions here will receive a single argument when called from validator.validate: the "name" of the field.
// - Because some message generator functions require additional arguments (such as minLength),
// all functions exported will be curried (within lib/validator/index.js).
// - Those additional arguments should be supplied in the form validations definition
// - To ensure your function behaves as expected, the name parameter should be the last param.
// In all cases, the name argument will be the last one supplied

/**
 * @function
 * @param  {string} name
 * @return {boolean}
 */
export function email (name) {
  return `${humanize(name)} must be a valid email address`;
}

/**
 * @function
 * @param  {string} name
 * @return {boolean}
 */
export function integer (name) {
  return `${humanize(name)} must consist of integers only`;
}

/**
 * @function
 * @param  {string|number} length
 * @param  {string} name
 * @return {boolean}
 */
export function maxLength (length, name) {
  return `${humanize(name)} must not be more than ${length} characters`;
}

/**
 * @function
 * @param  {string|number} length
 * @param  {string} name
 * @return {boolean}
 */
export function minLength (length, name) {
  return `${humanize(name)} must be at least ${length} characters`;
}

/**
 * @function
 * @param  {string} name
 * @return {boolean}
 */
export function numeric (name) {
  return `${humanize(name)} must consist of numbers only`;
}

/**
 * @function
 * @param  {string} name
 * @return {boolean}
 */
export function phone (name) {
  return `${humanize(name)} must be a valid phone number including your area code.`;
}

/**
 * @function
 * @param  {string} name
 * @return {boolean}
 */
export function required (name) {
  return `${humanize(name)} is a required field`;
}
