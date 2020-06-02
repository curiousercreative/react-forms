/**
 * read this form field's value from the parent form
 * @function getValue
 * @param {Field} field - form field component
 * @return {any}
 */
export default function getValue (field) {
  const { index, name } = field.props;

  return field.context.state.form._getValue(name, index);
}
