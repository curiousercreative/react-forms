import React from 'react';

/**
 * @class File
 * @param       {boolean} [disabled = false]
 * @param       {React.Ref} forwardedRef
 * @param       {function} getValue
 * @param       {string} id
 * @param       {string} [placeholder]
 * @param       {function} setValue
 * @constructor
 */
export default function NativeDate ({ disabled = false, forwardedRef, getValue, id, placeholder, setValue }) {
  const handleChange = React.useCallback(e => {
    setValue(e.target.value);
  }, [ setValue ]);

  return <input
    className="form__input form__input--type_file"
    disabled={disabled}
    id={id}
    onChange={handleChange}
    placeholder={placeholder}
    ref={forwardedRef}
    type="file"
    value={getValue() || null} />;
}
