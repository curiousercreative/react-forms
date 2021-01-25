/**
 * read this form field's value from the parent form
 * @function getValue
 * @param {Field} field - form field component
 * @return {any}
 */
export default function getValue (field) {
  const { index, name } = field.props;

  return typeof index === 'number'
    ? field.context.state.values[index][name]
    : field.context.state.values[name];
}
