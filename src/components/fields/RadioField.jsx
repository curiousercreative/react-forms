import React from 'react';

import Field from './Field';
import Radio from './Radio';

/**
 * @class RadioField
 * @param       {object} props
 * @return {jsx} Field
 */
export default function RadioField (props) {
  return <Field {...props} ref={props.forwardedRef} component={Radio} type="radio" />;
}
