/**
 * title case any string
 * @param  {string} str
 * @return {string}
 */
export default function titlize (str) {
  return str.split(' ')
    .map(word => word[0].toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}
