import React from 'react';
import Field from 'form/dist/components/fields/Field.jsx';
import NativeSelect from './NativeSelect.jsx';

export default function NativeSelectField (props) {
  return <Field {...props} component={NativeSelect} type="select" />
}
