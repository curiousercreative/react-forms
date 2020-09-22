import React from 'react';

/**
 * Multiline text input
 * @function Textarea
 * @param     {object} forwardedRef
 * @param     {function} getValue
 * @param     {string} id
 * @param     {string} name
 * @param     {number/string} [rows = 1]
 * @param     {function} setValue
 * @return    {jsx} textarea.form__input.form__input--type_textarea
 */
export default function Textarea ({ forwardedRef, getValue, id, name, rows = 1, setValue }) {
  const handleChange = React.useCallback(e => setValue(e.target.value), [ setValue ]);

  return <textarea
    id={id}
    className="form__input form__input--type_textarea"
    onChange={handleChange}
    name={name}
    ref={forwardedRef}
    rows={rows}
    value={getValue() || ''} />;
}
