import React from 'react';
import Field from './Field.jsx';
import File from './File.jsx';

/**
 * @class FileField
 * @param       {object} props
 */
export default function FileField (props) {
  return <Field {...props} ref={props.forwardedRef} component={File} type="file" />;
}
