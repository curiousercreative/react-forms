import React from 'react';

import Field from './Field';
import TagSelector from './TagSelector';

/**
 * @class TagSelectorField
 * @param       {object} props
 * @return {jsx} Field
 */
export default function TagSelectorField (props) {
  return <Field {...props} component={TagSelector} type="tag-selector" />;
}
