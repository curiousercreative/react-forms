/** @module components/SubmitButton */
import React, { useContext } from 'react';

import FormContext from './config/FormContext';

import exists from '../util/exists.js';

/**
 * button to submit a form, shows a loading spinner during loading
 * @function SubmitButton
 * @param {string} [className = '']
 * @param {jsx} children
 * @param {boolean} [disabled]
 * @param {boolean} [isLoading] will derive from parent form state if not provided
 * @param {boolean} [isValid] will derive from parent form state if not provided
 * @param {function} [onClick] if not supplied, button will be type="submit"
 * @param {string} [type]
 * @param {string} [value]
 * @return {jsx} button[type=submit|button]
 */
export default function SubmitButton ({ children, className = '', disabled, isLoading, isValid, onClick, type, value }) {
  const { form } = useContext(FormContext);
  if (!exists(disabled)) disabled = isLoading || !isValid;
  if (!exists(isLoading)) isLoading = form.state.isLoading;
  if (!exists(isValid)) isValid = !form.props.validateAsYouGo || form.state.isValid;
  let classes = className.split(' ').concat('form__submit');
  if (isLoading) classes.push('form__submit--is_loading');
  if (!type) type = onClick ? 'button' : 'submit';

  const props = {
    className: classes.join(' '),
    disabled,
    type,
  };

  if (typeof onClick === 'function') props.onClick = onClick;
  if (exists(value)) {
    if (typeof value !== 'string') console.warn(new Error(`SubmitButton expected a value prop with type string but received of type ${typeof value}. The value prop is relayed directly to a button HTML element and will be coerced into string`));
    props.value = value;
  }

  return <button {...props}>{children}</button>;
}
