import React from 'react';

import Option from './model/Option.js';

import renderIf from '../../util/renderIf.js';

// NOTE: anything complicated here is likely to allow option values other than strings

/**
 * @class NativeSelect
 * @param       {boolean}   [disabled = false]
 * @param       {React.ref} forwardedRef
 * @param       {function}  getValue
 * @param       {string}    id
 * @param       {function}  [optionKeySelector]
 * @param       {object[]}  options
 * @param       {string}    [placeholder]
 * @param       {Boolean}   [required=true]
 * @param       {function}  setValue
 * @returns     {jsx}       select
 */
export default function NativeSelect ({
  disabled = false,
  forwardedRef,
  getValue,
  id,
  optionKeySelector = o => o.value,
  options,
  placeholder,
  required = true,
  setValue,
}) {
  let classes = [ 'form__select', 'form-select', 'form-select--native' ];

  if (disabled) classes.push('form-select--disabled');

  const selectedIndexes = Option.getSelectedIndexes(options, getValue());

  const handleChange = React.useCallback((e) => {
    const value = Option.getValueFromNativeEvent(options, e);

    setValue(value);
  }, [ options, setValue ]);

  return (
    <select
      className={classes.join(' ')}
      disabled={disabled}
      id={id}
      onChange={handleChange}
      ref={forwardedRef}
      value={selectedIndexes.length ? selectedIndexes[0] : ''}>
      {renderIf(placeholder != null, () => (
        <option disabled={required} value="">{placeholder}</option>
      ))}
      {Option.getOptionsWithIndexes(options).map(o => (
        <option key={optionKeySelector(o)} value={o.i}>{o.label}</option>
      ))}
    </select>
  );
}
