import React from 'react';

import Field from './Field';
import Select from './Select';

/**
 * @class SelectField
 * @param       {object} props
 * @return {jsx} Field
 */
export default function SelectField (props) {
  return <Field {...props} ref={props.forwardedRef} component={Select} retainsFocus type="select" />;
}
