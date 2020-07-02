import React from 'react';
import Field from './Field.jsx';
import NativeSelect from './NativeSelect.jsx';

export default function NativeSelectField (props) {
  return <Field {...props} ref={props.forwardedRef} component={NativeSelect} type="select" />;
}
