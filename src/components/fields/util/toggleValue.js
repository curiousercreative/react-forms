import getValue from './getValue';

const DEFAULT_VALUE = null;
const DEFAULT_VALUE_BOOLEAN = false;
const DEFAULT_VALUE_STRING = '';

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
  let defaultVal;
  let toggledVal;

  switch (typeof value) {
    case 'boolean':
      defaultVal = DEFAULT_VALUE_BOOLEAN;
      break;
    case 'string':
      defaultVal = DEFAULT_VALUE_STRING;
      break;
    default:
      defaultVal = DEFAULT_VALUE;
  }

  // deal with arrays
  if (Array.isArray(formVal)) {
    toggledVal = formVal.includes(value)
      // value is already in array, remove it
      ? formVal.filter(v => v !== value)
      // value isn't in array, add it
      : formVal.concat(value);
  }
  else {
    // if value is already set, reset to default
    // if value isn't set, set to value
    toggledVal = formVal === value ? defaultVal : value;
  }

  return field.context.actions.setValue(name, toggledVal, 'field', index);
}
