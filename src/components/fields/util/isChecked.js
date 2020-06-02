import getValue from './getValue';

/**
 * read this form field's value from the parent form and see if it matches field value
 * used by fields that behave as radio or checkboxes
 * @function isChecked
 * @param {Field} field - form field component
 * @return {any}
 */
export default function isChecked (field) {
  const formValue = getValue(field);

  return Array.isArray(formValue)
    // form value is an array, we're checked if the array includes our value
    ? formValue.includes(field.props.value)
    // form value is not an array, we're checked if values match
    : formValue === field.props.value;
}
