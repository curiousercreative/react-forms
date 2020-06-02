import React from 'react';

import Field from './Field';
import Text from './Text';

/**
 * @class TextField
 * @param       {object} props
 * @return {jsx} Field
 */
export default function TextField (props) {
  let type = props.type || 'text';

  return <Field {...props} component={Text} type={type} />;
}
