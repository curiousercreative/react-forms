/**
 * capitalize the first letter of a string, but leave the rest untouched
 * @function capitalize
 * @memberof module:lib/transformers
 * @param  {string} str
 * @return {string}
 */
export default function capitalize (str) {
  if (!str) return str;

  return `${str[0].toUpperCase()}${str.slice(1)}`;
}
