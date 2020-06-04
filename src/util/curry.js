/**
 * @param  {function} func
 * @return {function|any} partially applied function or return value if fully applied
 * @credit https://javascript.info/currying-partials
 */
export default function curry (func) {
  return function curried (...args) {
    return args.length >= func.length
      ? func.apply(this, args)
      : function pass (...args2) {
        return curried.apply(this, args.concat(args2));
      };
  };
}
