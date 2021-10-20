import capitalize from './capitalize';
import titlize from './titlize';

/**
 * convert a machine readable string to a human readable string
 * treats uppercase, space, - and _ as word delimiters
 * @function humanize
 * @memberof module:lib/transformers
 * @param  {string} str
 * @param {string} [casing = 'sentence'] - sentence | title
 * @return {string}
 * @example
 * humanize('some_snake_case') => 'Some snake case'
 * humanize('some-pipe-case') => 'Some pipe case'
 * humanize('some word') => 'Some word'
 * humanize('someCamelCase') => 'Some camel case'
 * humanize('SomePascalCase') => 'Some pascal case'
 */
export default function humanize (str, casing = 'sentence') {
  if (!str) return str;

  str = str
    // converts all cap casing toLowerCase with a preceding space
    .replace(/[^A-Z]([A-Z])/g, str => `${str[0]} ${str[1].toLowerCase()}`)
    // split it up
    .split(/[-_\s]+/)
    // glue it back
    .join(' ')
    // trim whitespace
    .trim();

  switch (casing) {
    case 'lower':
      return str.toLowerCase();
    case 'sentence':
      return capitalize(str);
    case 'title':
      return titlize(str);
    case 'upper':
      return str.toUpperCase();
    default:
      return str;
  }
}
