/**
 * higher order function that always returns the value given
 * @function tap
 * @param  {function} fn - thunk (fn to be called later)
 * @return {function} function
 */
export default function tap (fn) {
  /**
   * @param  {variable} val - could be anything, whatever single value is supplied to the result of tap
   * @return {variable} val - the same value it's given
   */
  return function (val) {
    fn(val);
    return val;
  };
}
