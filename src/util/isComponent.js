/**
 * @param  {any}  component
 * @return {boolean}
 */
export default function isComponent (component) {
  return component && (
    typeof component === 'function'
    || typeof component.render === 'function'
  );
}
