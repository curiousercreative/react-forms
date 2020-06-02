import getValue from './getValue';

const DEFAULT_VALUE = '';

/**
 * update this form field's value on the parent form by toggling
 * @function toggleValue
 * @param {Field} field - form field component
 * @param {any} value - the value to toggle for this field
 * @return {any} but probably undefined
 */
export default function toggleValue (field, value) {
  const { index, name } = field.props;
  const formVal = getValue(field);
  let toggledVal;

  // deal with arrays
  if (Array.isArray(formVal)) {
    toggledVal = formVal.includes(value)
      // value is already in array, remove it
      ? formVal.filter(v => v !== value)
      // value isn't in array, add it
      : formVal.concat(value);
  }
  else {
    toggledVal = getValue(field) === value
      // value is already set, reset to default
      ? DEFAULT_VALUE
      // value isn't set, set it
      : value;
  }

  return field.context.actions.setValue(name, toggledVal, index);
}
