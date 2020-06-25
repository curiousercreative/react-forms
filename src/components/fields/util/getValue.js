/**
 * read this form field's value from the parent form
 * @function getValue
 * @param {Field} field - form field component
 * @return {any}
 */
export default function getValue (field) {
  const { index, name } = field.props;

  return field.context.form.getValue(name, index);
  // TODO: consider and test the below, specifically to ensure that all
  // our getValueFor, formatValueFor, etc hooks work properly
  // return typeof index === 'number'
  //   ? field.context.state.values[index][name]
  //   : field.context.state.values[name];
}
