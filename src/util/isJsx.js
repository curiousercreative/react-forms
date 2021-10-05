/**
 * @param  {object|any}  jsx
 * @return {boolean}
 */
export default function isJsx (jsx) {
  try {
    return '$$typeof' in jsx;
  }
  catch (e) {
    return false;
  }
}
