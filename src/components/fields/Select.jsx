import React from 'react';

import DropdownWrapper from './components/DropdownWrapper.jsx';

import bindMethods from '../../util/bindMethods.js';
import exists from '../../util/exists.js';

let id = 0;
/**
 * a custom dropdown/select input
 * @class Select
 * @property {boolean} [disabled]
 * @property {string} name
 * @property {object[]} options
 * @property {string} options[].label
 * @property {string} options[].value
 * @property {function} [optionKeySelector]
 * @property {string} [placeholder]
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
  id = `select${id++}`;
  inputRef = React.createRef();

  state = {
    isOpen: false,
  };

  constructor (...args) {
    super(...args);
    bindMethods(this);
  }

  handleClick () {
    if (!this.props.disabled) this.open();
  }

  close () {
    this.setIsOpen(false);
  }

  focus () {
    this.inputRef.current.focus();

    // NOTE: async to band-aid a race condition between this and componentDidUpdate
    setTimeout(() => this.open(), 60);
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

  open () {
    this.setIsOpen(true);
  }

  setIsOpen (isOpen) {
    this.setState({ isOpen });
  }

  render () {
    let classes = ['form__select', 'form-select'];

    if (this.props.disabled) classes.push('form-select--disabled');

    return (
      <DropdownWrapper
        className={classes.join(' ')}
        isOpen={this.state.isOpen}
        onSelect={this.props.setValue}
        options={this.props.options}
        setIsOpen={this.setIsOpen}
        value={this.props.getValue()}>
        <button ref={this.inputRef} className="form__btn-reset form-select__value" onClick={this.handleClick} type="button">
          <span>{this.getLabel()}</span>
          <i className="icon icon-angle-down" />
        </button>
      </DropdownWrapper>
    );
  }
}
