import capitalize from './capitalize';

/**
 * convert a string to pascal casing and treat - and _ as word delimiters
 * @function pascalize
 * @memberof module:lib/transformers
 * @param  {string} str
 * @return {string}
 * @example
 * pascalize('some_snake_case') => 'SomeSnakeCase'
 * pascalize('some-pipe-case') => 'SomePipeCase'
 * pascalize('some word') => 'SomeWord'
 * pascalize('someCamelCase') => 'SomeCamelCase'
 */
export default function pascalize (str) {
  if (!str) return str;

  return str
    .split(/[-_\s]/)
    .map(capitalize)
    .join('');
}
