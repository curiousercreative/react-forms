import React from 'react';
import DropdownWrapper from './components/DropdownWrapper';
import exists from '../../util/exists.js';

/**
 * @param       {React.Ref}  forwardedRef - comes from Field
 * @param       {boolean} hasFocus - comes from Field
 * @param       {function}  getValue - comes from Field
 * @param       {function}  onQuery - handle changing query value, should update incoming options
 * @param       {function}  [onSelect] - async or sync transform of selected value
 * @param       {function}  [optionKeySelector] - DropdownWrapper
 * @param       {object[]}  options - passthrought to DropdownWrapper
 * @param       {string}  [placeholder]
 * @param       {function}  setValue - comes from Field
 * @returns     {jsx} .form__dropdown-wrapper
 */
export default function AutoSuggest ({
  forwardedRef,
  hasFocus,
  getValue,
  onQuery,
  onSelect,
  optionKeySelector,
  options,
  placeholder,
  setValue,
}) {
  const [ isOpen, setIsOpen ] = React.useState(false);
  const [ query, setQuery ] = React.useState(getValue() || '');

  const _setValue = React.useCallback(val => {
    // allow transformed value to
    switch (typeof val) {
      case 'string':
        setQuery(val);
        setValue(val);
        break;
      case 'object':
        setQuery(val.label);
        setValue(val.value);
        break;
    }
  }, [ setValue ]);

  /** @param {Event} e */
  const handleChange = React.useCallback(e => {
    const { value } = e.target;

    // allow optional onQuery to transform val
    const promiseFn = typeof onQuery === 'function' ? onQuery : Promise.resolve;

    // allow optional onQuery to execute async or sync
    Promise.resolve(promiseFn(value))
      .then(transformedValue => exists(transformedValue) ? transformedValue : value)
      .then(_setValue);
  }, [ onQuery ]);

  /** @param {any} val */
  const handleSelect = React.useCallback(val => {
    // allow optional onSelect to transform val
    const promiseFn = typeof onSelect === 'function' ? onSelect : Promise.resolve;

    // allow optional onSelect to execute async or sync
    Promise.resolve(promiseFn(val))
      .then(transformedValue => exists(transformedValue) ? transformedValue : val)
      .then(_setValue)
      .then(() => setIsOpen(false));
  }, [ onSelect, setValue ]);

  React.useEffect(() => {
    if (hasFocus) setIsOpen(!!options.length);
  }, [ hasFocus, options ]);

  // initialize value and query
  React.useEffect(() => {
    _setValue(getValue());
  }, []);

  return (
    <DropdownWrapper
      focusOnOpen={false}
      hasFocus={hasFocus}
      isOpen={isOpen}
      onSelect={handleSelect}
      options={options}
      optionKeySelector={optionKeySelector}
      setIsOpen={setIsOpen}>
      <input
        className="form__input form__input--type_text"
        onChange={handleChange}
        placeholder={placeholder}
        ref={forwardedRef}
        type="text"
        value={query} />
    </DropdownWrapper>
  );
}
