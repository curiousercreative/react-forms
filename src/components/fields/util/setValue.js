import getValue from './getValue';

/**
 * update this form field's value on the parent form
 * @function setValue
 * @param {Field} field - form field component
 * @param {any} value - the value to set for this field
 * @return {any} but probably undefined
 */
export default function setValue (field, value) {
  const { index, name } = field.props;
  const formVal = getValue(field);
  let val = value;

  // deal with arrays
  if (Array.isArray(formVal)) {
    val = formVal.includes(value)
      // value is already in array, no work to do
      ? formVal
      // value isn't in array, add it
      : formVal.concat(value);
  }

  return field.context.actions.setValue(name, val, 'field', index);
}
