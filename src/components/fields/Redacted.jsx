import React from 'react';

/**
 * @param {boolean} [asPassword]
 * @param {string} [autoComplete]
 * @param {boolean} [disabled]
 * @param {React.Ref} [forwardedRef]
 * @param {function} getValue
 * @param {boolean} [hasFocus]
 * @param {string} id
 * @param {string} [inputMode]
 * @param {string} name
 * @param {string} [placeholder]
 * @param {any} [readOnly]
 * @param {function} setValue
 * @param {string} [type = text]
 * @return {jsx} .form-password > input.form__input
 */
export default function RedactedInput ({
  asPassword,
  autoComplete,
  disabled,
  forwardedRef,
  getValue,
  hasFocus,
  id,
  inputMode,
  name,
  placeholder,
  readOnly,
  setValue,
  type = 'text',
}) {
  const [ showPassword, setShowPassword ] = React.useState(false);
  const [ cursor, setCursor ] = React.useState();
  const _showPassword = (asPassword && showPassword) // in password mode, showPassword must be toggled
    || (!asPassword && hasFocus); // otherwise, we must be focused
  const _value = getValue() || '';
  // are we rendering redacted?
  const value = _showPassword ? _value : _value.replace(/./g, '•');

  const handleClickToggle = React.useCallback(() => setShowPassword(!showPassword), [ showPassword ]);
  const handleInput = React.useCallback(e => {
    const { data, inputType } = e.nativeEvent;

    // TODO: reconsider this component altogether, there are a lot of inputTypes to consider
    // https://rawgit.com/w3c/input-events/v1/index.html#interface-InputEvent-Attributes
    switch (inputType) {
      case 'deleteContentBackward':
        setValue(_value.slice(0, cursor[0] === cursor[1] ? cursor[0] - 1 : cursor[0]) + _value.slice(cursor[1]));
        break;
      case 'deleteContentForward':
        setValue(_value.slice(0, cursor[0]) + _value.slice(cursor[0] === cursor[1] ? cursor[1] + 1 : cursor[1]));
        break;
      case 'insertText':
      default:
        setValue(_value.slice(0, cursor[0]) + data + _value.slice(cursor[1]));
        break;
    }
  }, [ _value, cursor ]);

  const handleSelect = React.useCallback(e => {
    const { selectionDirection, selectionEnd, selectionStart } = e.target;
    setCursor([ selectionStart, selectionEnd, selectionDirection ]);
  }, []);

  const input = <input
    autoComplete={autoComplete}
    className={`form__input form__input--type_${type}`}
    disabled={disabled}
    id={id}
    inputMode={inputMode}
    name={name}
    onInput={handleInput}
    onSelect={handleSelect}
    placeholder={placeholder}
    readOnly={readOnly}
    ref={forwardedRef}
    type={type}
    value={value} />;

  return asPassword
    ? (
      <div className="form-password">
        {input}
        <button className="form__btn-reset" onClick={handleClickToggle} type="button">{showPassword ? 'hide' : 'show'}</button>
      </div>
    ) : input;
}
