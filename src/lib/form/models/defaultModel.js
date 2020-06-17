import validator from '../../validator';
import { pascalize } from '../../transformers';

/**
 * clean - transform external data for store
 * @param {string} name
 * @param {string|any} value
 * @return {string|any}
 */
function clean (name, value) {
  return value;
}

/**
 * format - transform form data before sending to external sources or view components
 * @param  {string} name
 * @param  {string|any} value
 * @return {string|any}
 */
function format (name, value) {
  return value;
}

/**
 * selectPrimaryKey
 * @param  {object} modelInstance
 * @return {string|number|any} primary key
 */
function selectPrimaryKey (modelInstance) {
  return modelInstance.id;
}

/**
 * localStateStore
 * @param  {object} instance - Form component instance
 * @return {object}
 */
export default function defaultModel (instance) {
  /**
   * formatValue - transform values from store for consumption by view components
   * or external components
   * @param  {string} name
   * @param  {string|any} value
   * @return {string|any}
   */
  function formatValue (name, value) {
    // if we don't have a field specific parser, make one based on parse
    if (!this[`formatValueFor${pascalize(name)}`]) {
      this[`formatValueFor${pascalize(name)}`] = format.bind(this, name);
    }

    const parser = this[`formatValueFor${pascalize(name)}`];
    return parser(value);
  }

  /**
   * cleanValue - util/setValue calls this
   * @param {string} name
   * @param {string|any} value
   * @return {string|any}
   */
  function cleanValue (name, value) {
    // if we don't have a field specific cleaner, make one based on cleanValue
    if (!this[`cleanValueFor${pascalize(name)}`]) {
      this[`cleanValueFor${pascalize(name)}`] = clean.bind(this, name);
    }

    const cleaner = this[`cleanValueFor${pascalize(name)}`];

    return cleaner(value);
  }

  /**
   * validate - validate the entire form and render errors (unless disabled)
   * @param  {Boolean} [displayErrors=true] flag to disable error rendering
   * @return {boolean} true = valid
   */
  function validate (displayErrors = true) {
    // arrayify to  FormCollection
    const errors = validator.validate(instance.store.values(), instance.getValidations());

    // if there are any, form is invalid
    instance.isValid = errors.length === 0;

    // store errors for rendering
    if (displayErrors) {
      instance.setErrors(errors);

      // NOTE: hacky way of guessing whether we just triggered a re-render
      if (!instance.state.errors) this.forceUpdate();
    }

    // if there are no errors, form is valid
    return instance.isValid;
  }

  /**
   * _validateField - run validations for a single field and return next state of form errors
   * @param  {string} name
   * @param  {number} [index]
   * @return {object[]} errors
   */
  function _validateField (name, index) {
    const data = { [name]: instance.getValue(name, index) };

    // validate just this field
    const fieldErrors = validator.validate(data, instance.getValidations(), false);

    return [
      // keep the previous errors except for this field
      ...instance.getErrors(index).filter(e => e.name !== name),
      // add the errors for just this field
      ...fieldErrors,
    ];
  }

  /**
   * validateField - validate a single field (while preserving all other field errors)
   * @param  {string}  name - the field to validate
   * @param  {number} [index]
   * @param  {Boolean} [displayErrors=true]
   * @return {boolean} true = valid
   */
  function validateField (name, index, displayErrors = true) {
    const errors = _validateField(name, index);

    // store errors for rendering
    if (displayErrors) instance.setErrors(errors);

    return errors.length === 0;
  }

  return {
    cleanValue,
    formatValue,
    selectPrimaryKey,
    validate,
    validateField,
    validations: [],
  };
}
