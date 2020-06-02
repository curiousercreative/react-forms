/**
 * debounce - acts as a throttle to ensure that a function is executed at most once
 * per period of time
 * @param  {function} fn        whatever we want to do
 * @param  {number}   wait      period of time to limit our function execution to (in milliseconds)
 * @param  {boolean}  immediate whether to execute function at beginning of period
 * @return {function} function has a "cancel" method
 * @example
 * // debounce a scroll event handler so that we update state at most once every 500ms
 * handleScroll = debounce ((e) => {
 *   this.setState({ scrollY: window.scrollY });
 * }, 500, true);
 */
export default function debounce (fn, wait, immediate) {
  let timeout;

  // the function we will eventually return
  // Must spread args AND use arrow function
  const debounced = (...args) => {
    const callNow = immediate && !timeout;

    // use that arrow function to pass context
    const later = () => {
      timeout = null;
      if (!immediate) fn(...args);
    };

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);

    if (callNow) fn(...args);
  };

  // allows us to cancel any pending executions
  debounced.cancel = () => {
    clearTimeout(timeout);
    timeout = null;
  };

  return debounced;
}
