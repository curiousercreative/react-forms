import React from 'react';
import { util } from '@curiouser/react-forms';

/**
 * @param       {function}  getValue
 * @param       {string}    id
 * @param       {object[]}  options
 * @param       {string}    [placeholder]
 * @param       {Boolean}   [required=true]
 * @param       {function}  setValue
 * @returns     {jsx}       select
 */
export default function NativeSelect ({ getValue, id, options, placeholder, required = true, setValue }) {
  const handleChange = React.useCallback((e) => setValue(e.target.value), [ setValue ]);

  return (
    <select id={id} onChange={handleChange} value={getValue()}>
      {util.renderIf(placeholder, () => (
        <option disabled={required} value="">{placeholder}</option>
      ))}
      {options.map(o => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}
