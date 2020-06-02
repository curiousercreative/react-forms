function defaultSelector (a) {
  return a;
}

/**
 * @param  {array} inputList
 * @return {array} deduped/unique list
 */
export default function uniq (inputList, selector = defaultSelector) {
  const outputList = [];
  const set = new Set();

  inputList.forEach(item => !set.has(selector(item)) && outputList.push(item));

  return outputList;
}
