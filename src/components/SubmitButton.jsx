import React, { useContext } from 'react';

import FormContext from './config/FormContext';

/**
 * button to submit a form, shows a loading spinner during loading
 * @class SubmitButton
 * @param {string} [className = '']
 * @param {jsx} children
 * @param {boolean} [isLoading] will derive from parent form state if not provided
 * @param {function} [onClick] if not supplied, button will be type="submit"
 * @return {jsx} button[type=submit|button]
 */
export default function SubmitButton ({ children, className = '', isLoading, onClick }) {
  const { form, isValid } = useContext(FormContext).state;
  isLoading = typeof isLoading === 'undefined' ? form.state.isLoading : isLoading;
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
