import React from 'react';

export default function NativeDate ({ forwardedRef, getValue, id, placeholder, setValue }) {
  const handleChange = React.useCallback(e => {
    setValue(e.target.value);
  }, [ setValue ]);

  return <input
    className="form__input form__input--type_date"
    id={id}
    onChange={handleChange}
    placeholder={placeholder}
    ref={forwardedRef}
    type="date"
    value={getValue() || ''} />;
}
