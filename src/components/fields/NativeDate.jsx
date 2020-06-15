import React from 'react';

export default function NativeDate ({ getValue, id, placeholder, setValue }) {
  const handleChange = React.useCallback(e => {
    setValue(e.target.value);
  }, [ setValue ]);

  return <input
    id={id}
    onChange={handleChange}
    placeholder={placeholder}
    type="date"
    value={getValue() || ''} />;
}
