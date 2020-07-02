import React from 'react';

import Field from './Field';
import Password from './Password';

/**
 * @class PasswordField
 * @param       {object} props
 * @return {jsx} Field
 */
export default function PasswordField (props) {
  return <Field {...props} ref={props.forwardedRef} component={Password} type="password" />;
}
