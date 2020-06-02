import capitalize from './capitalize';

/**
 * convert a machine readable string to a human readable string
 * treats uppercase, space, - and _ as word delimiters
 * @function humanize
 * @memberof module:lib/transformers
 * @param  {string} str
 * @param {boolean} [sentenceCase] - if true, capitalizes first character
 * @return {string}
 * @example
 * humanize('some_snake_case') => 'Some snake case'
 * humanize('some-pipe-case') => 'Some pipe case'
 * humanize('some word') => 'Some word'
 * humanize('someCamelCase') => 'Some camel case'
 * humanize('SomePascalCase') => 'Some pascal case'
 */
export default function humanize (str, sentenceCase = true) {
  if (!str) return str;

  // Set the first character casing
  str = sentenceCase ? capitalize(str) : `${str[0].toLowerCase()}${str.slice(1)}`;

  return str
    // skips the first character, then converts all subsequent cap casing toLowerCase
    // with a preceding space
    .replace(/.+([A-Z])/g, match => ` ${match.toLowerCase()}`)
    // split it up
    .split(/[-_\s]+/)
    // glue it back
    .join(' ');
}
