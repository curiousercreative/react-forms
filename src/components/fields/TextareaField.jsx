import React from 'react';

import Field from './Field';
import Textarea from './Textarea';

/**
 * @class TextareaField
 * @param       {object} props
 * @return {jsx} Field
 */
export default function TextareaField (props) {
  return <Field {...props} ref={props.forwardedRef} component={Textarea} type="textarea" />;
}
