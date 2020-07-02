import React from 'react';
import Field from './Field.jsx';
import NativeDate from './NativeDate.jsx';

export default function NativeDateField (props) {
  return <Field {...props} ref={props.forwardedRef} component={NativeDate} type="date" />;
}
