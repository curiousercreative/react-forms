import React from 'react';

import Field from './Field';
import Redacted from './Redacted';

/**
 * @param       {object} props
 * @return      {jsx} .form__field
 */
export default function RedactedField (props) {
  const type = props.type || 'text';

  return <Field {...props} component={Redacted} type={type} />;
}
