import React from 'react';
import Input from './model/Input.js';
import bindMethods from '../../util/bindMethods.js';

/**
 * As basic as it gets, a text input
 * @class Text
 * @property {string} [autoComplete]
 * @property {boolean} [disabled = false]
 * @property {React.Ref} [forwardedRef]
 * @property {boolean} [hasFocus]
 * @property {string} id
 * @property {string} [inputMode]
 * @property {string} name
 * @property {any} [readOnly]
 * @property {string} [type] - supply a type to hint device's virtual keyboard
 * @return {jsx} input.form__input
 */
export default class Text extends React.Component {
  static defaultProps = {
    disabled: false,
  };

  constructor (...args) {
    super(...args);
    bindMethods(this);
  }

  handleChange (e) {
    // handle a change to this field's value by user input
    this.props.setValue(e.target.value);
  }

  render () {
    return <input
      id={this.props.id}
      autoComplete={this.props.autoComplete}
      className="form__input form__input--type_text"
      disabled={this.props.disabled}
      inputMode={this.props.inputMode || Input.getInputMode(this.props.type)}
      name={this.props.name}
      onChange={this.handleChange}
      readOnly={this.props.readOnly}
      ref={this.props.forwardedRef}
      placeholder={this.props.placeholder}
      type={Input.getType(this.props.type)}
      value={this.props.getValue() || ''} />;
  }
}
