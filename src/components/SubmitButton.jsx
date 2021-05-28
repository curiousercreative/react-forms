/** @module components/SubmitButton */
import React, { useContext } from 'react';

import FormContext from './config/FormContext';

import exists from '../util/exists.js';

/**
 * button to submit a form, shows a loading spinner during loading
 * @function SubmitButton
 * @param {string} [className = '']
 * @param {jsx} children
 * @param {boolean} [isLoading] will derive from parent form state if not provided
 * @param {boolean} [isValid] will derive from parent form state if not provided
 * @param {function} [onClick] if not supplied, button will be type="submit"
 * @return {jsx} button[type=submit|button]
 */
export default function SubmitButton ({ children, className = '', isLoading, isValid, onClick }) {
  const { form } = useContext(FormContext);
  isLoading = exists(isLoading) ? isLoading : form.state.isLoading;
  isValid = exists(isValid) ? isValid : !form.props.validateAsYouGo || form.state.isValid;
  let classes = className.split(' ').concat('form__submit');
  if (isLoading) classes.push('form__submit--is_loading');

  let props = {
    className: classes.join(' '),
    disabled: isLoading || !isValid,
    type: onClick ? 'button' : 'submit',
  };

  if (typeof onClick === 'function') props.onClick = onClick;

  return <button {...props}>{children}</button>;
}
