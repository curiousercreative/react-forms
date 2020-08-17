import React from 'react';

import Field from './Field';
import Checkbox from './Checkbox';

/**
 * @class CheckboxField
 * @param       {object} props
 * @return {jsx} Field
 */
export default function CheckboxField (props) {
  const value = 'value' in props ? props.value : true;

  return <Field {...props} ref={props.forwardedRef} component={Checkbox} type="checkbox" value={value} />;
}
