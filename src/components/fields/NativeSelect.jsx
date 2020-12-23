import React from 'react';
import { util } from '@curiouser/react-forms';

/**
 * @class NativeSelect
 * @param       {boolean}   [disabled]
 * @param       {function}  getValue
 * @param       {string}    id
 * @param       {object[]}  options
 * @param       {string}    [placeholder]
 * @param       {Boolean}   [required=true]
 * @param       {function}  setValue
 * @returns     {jsx}       select
 */
export default function NativeSelect ({ disabled, forwardedRef, getValue, id, options, placeholder, required = true, setValue }) {
  const handleChange = React.useCallback((e) => setValue(e.target.value), [ setValue ]);
  let classes = [ 'form__select', 'form-select', 'form-select--native' ];

  if (disabled) classes.push('form-select--disabled');

  return (
    <select
      className={classes.join(' ')}
      id={id}
      onChange={handleChange}
      ref={forwardedRef}
      value={getValue()}>
      {util.renderIf(placeholder, () => (
        <option disabled={required} value="">{placeholder}</option>
      ))}
      {options.map(o => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}
