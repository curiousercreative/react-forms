import React from 'react';
import AutoSuggest from './AutoSuggest';
import Field from './Field';

export default function AutoSuggestField (props) {
  return <Field {...props} component={AutoSuggest} retainsFocus type="auto-suggest" />;
}
