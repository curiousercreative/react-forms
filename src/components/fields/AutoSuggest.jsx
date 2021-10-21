import React from 'react';
import DropdownWrapper from './components/DropdownWrapper';

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

  /** @param {Event} e */
  const handleChange = React.useCallback(e => {
    setQuery(e.target.value);
    onQuery(e.target.value);
  }, [ onQuery ]);

  /** @param {any} val */
  const handleSelect = React.useCallback(val => {
    // allow optional onSelect to transform val
    const promiseFn = typeof onSelect === 'function' ? onSelect : Promise.resolve;

    // allow optional onSelect to execute async or sync
    Promise.resolve(promiseFn(val)).then(val => {
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
      setIsOpen(false);
    });
  }, [ onSelect, setValue ]);

  React.useEffect(() => {
    if (hasFocus) setIsOpen(!!options.length);
  }, [ hasFocus, options ]);

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
