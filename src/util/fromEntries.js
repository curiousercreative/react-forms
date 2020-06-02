/**
 * fromEntries - Object.fromEntries
 * @param  {Array}  [entries=[]]
 * @return {object}
 */
export default function fromEntries (entries = []) {
  // short circuit if built-in available
  if (typeof Object.fromEntries === 'function') return Object.fromEntries(entries);

  let obj = {};

  entries.forEach(([ key, val ]) => {
    obj[key] = val;
  });

  return obj;
}
