import React from 'react';

export default function NativeDate ({ getValue, id, placeholder, setValue }) {
  const handleChange = React.useCallback(e => {
    setValue(e.target.value);
  }, [ setValue ]);

  return <input
    className="form__input form__input--type_date"
    id={id}
    onChange={handleChange}
    placeholder={placeholder}
    type="date"
    value={getValue() || ''} />;
}
