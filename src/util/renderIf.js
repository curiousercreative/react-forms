const defaultNeg = () => null;

/**
 * @param  {boolean} expression
 * @param  {function} affirmative
 * @param  {function} [negative]
 * @return {jsx}
 */
export default function renderIf (expression, affirmative, negative = defaultNeg) {
  return expression ? affirmative() : negative();
}
