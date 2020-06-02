function defaultSelector (a) {
  return a;
}

/**
 * @param  {array} inputList
 * @param  {function} [selector = a => a] optional selector function for returning identifier
 * @return {array} deduped/unique list
 */
export default function uniq (inputList, selector = defaultSelector) {
  const outputList = []; // our deduped list to return
  const set = new Set(); // our set of items in output list optimized for lookup

  inputList.forEach(item => {
    const v = selector(item);

    if (!set.has(v)) {
      set.add(v);
      outputList.push(item);
    }
  });

  return outputList;
}
