import React from 'react';

import Field from './Field';
import Text from './Text';

/**
 * @class EmailField
 * @param  {object} props
 * @return {jsx} Field
 */
export default function EmailField (props) {
  return <Field {...props} component={Text} type="email" />;
}
