import React from 'react';

import DropdownWrapper from './components/DropdownWrapper.jsx';

import bindMethods from '../../util/bindMethods.js';
import exists from '../../util/exists.js';

/**
 * a custom dropdown/select input
 * @class Select
 * @property {boolean} [disabled = false]
 * @property {boolean} [closeOnSelect = true]
 * @property {string} id
 * @property {string} name
 * @property {boolean} [native = false]
 * @property {function} [noOptions]
 * @property {object[]} options
 * @property {string} options[].label
 * @property {string} options[].value
 * @property {function} [optionKeySelector]
 * @property {string} [placeholder]
 * @property {boolean} [required=true]
 *
 * TEST CASES:
 * Given the dropdown is hidden, dropdown should display when "value" is clicked
 * Given the dropdown is visible, dropdown should hide when "value" is clicked
 * Given the dropdown is visible, dropdown should hide when any item from dropdown is clicked
 * Given the dropdown is visible, dropdown should hide when user clicks outside of dropdown
 * Given the dropdown is visible, dropdown should hide when user focus leaves component
 * Given dropdown is visible, "value" should update when user selects any item from dropdown
 * Given dropdown is visible, up and down keys should navigate dropdown items
 * Given dropdown is visible, pressing enter should select dropdown item
 * Given dropdown is visible, pressing escape should hide dropdown
 */
export default class Select extends React.Component {
  static defaultProps = {
    closeOnSelect: true,
    disabled: false,
    native: false,
    optionKeySelector: opt => opt.value,
    required: true,
  };

  state = {
    isOpen: false,
  };

  constructor (...args) {
    super(...args);
    bindMethods(this);
  }

  handleClick () {
    this.setIsOpen(true);
  }

  getLabel () {
    const opt = this.props.options.find(opt => opt.value === this.props.getValue());
    let { placeholder } = this.props;

    // placeholder not supplied, attempt to use the label of first option provided
    if (!exists(placeholder)) {
      // support use case of no options supplied on mount
      try {
        placeholder = this.props.options[0].label;
      }
      catch (e) { console.warn('Select field mount with no options', e); }
    }

    return opt ? opt.label : placeholder;
  }

  select (value) {
    this.props.setValue(value);
    if (this.props.closeOnSelect) {
      // restore focus before closing dropdown
      if (this.props.forwardedRef.current) {
        this.props.forwardedRef.current.focus();
      }
      this.setIsOpen(false);
    }
  }

  setIsOpen (isOpen) {
    if (isOpen === this.state.isOpen) return Promise.resolve();

    return new Promise(resolve => this.setState({ isOpen }, resolve));
  }

  render () {
    let classes = ['form__select', 'form-select'];

    if (this.props.disabled) classes.push('form-select--disabled');

    return (
      <DropdownWrapper
        className={classes.join(' ')}
        hasFocus={this.props.hasFocus}
        isOpen={this.state.isOpen}
        noOptions={this.props.noOptions}
        onSelect={this.select}
        optionKeySelector={this.props.optionKeySelector}
        options={this.props.options}
        setIsOpen={this.setIsOpen}
        value={this.props.getValue()}>
        <button
          className="form__btn-reset form-select__value"
          disabled={this.props.disabled}
          id={this.props.id}
          onClick={this.handleClick}
          ref={this.props.forwardedRef}
          type="button">
          <span>{this.getLabel()}</span>
        </button>
      </DropdownWrapper>
    );
  }
}
