import React from 'react';

import Field from './Field';
import Checkbox from './Checkbox';

/**
 * @class CheckboxField
 * @param       {object} props
 * @return {jsx} Field
 */
export default function CheckboxField (props) {
  return <Field {...props} ref={props.forwardedRef} component={Checkbox} type="checkbox" />;
}
