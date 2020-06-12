import React from 'react';
import exists from '../../util/exists.js';
import { findDOMNode } from 'react-dom';

import bindMethods from '../../util/bindMethods.js';
import { addEventListener, removeEventListener } from '../../lib/domEvents.js';

import FormContext from '../config/FormContext';
import getValue from './util/getValue';
import setValue from './util/setValue';

let id = 0;
/**
 * a custom dropdown/select input
 * @class Select
 * @property {string} name
 * @property {object[]} options
 * @property {string} options[].label
 * @property {string} options[].value
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
  static contextType = FormContext;

  id = `select${id++}`;
  list = [];
  state = {
    highlightIndex: -1,
    isOpen: false,
  };

  constructor (...args) {
    super(...args);
    bindMethods(this);
  }

  componentDidMount () {
    const value = getValue(this);

    // set initial value
    if (value) findDOMNode(this).value = value;

    // listen to key presses

    addEventListener('keydown', this.handleKeys);
  }

  componentDidUpdate () {
    // if we lost focus and we're open, close
    if (this.state.isOpen && !this.props.hasFocus) this.close();
  }

  componentWillUnmount () {
    removeEventListener('keydown', this.handleKeys);
  }

  handleClick () {
    this.open();
  }

  handleClickItem (e) {
    // setValue(this, e.target.value);
    const val = this.props.options.find(({ value }) => String(value) === e.target.value).value;
    setValue(this, val);
  }

  // TODO: this and other methods are modified copies from SearchField.jsx
  // look into having the code shared?
  handleKeys (e) {
    const { highlightIndex } = this.state;

    // don't do anything if not focused
    if (this.props.hasFocus && this.list.length) {
      switch (e.which) {
        case 27: // escape
          this.close();
          break;
        case 38: // up
          e.preventDefault();
          // protect against out of bounds
          this.focusResult(highlightIndex > 0 ? highlightIndex - 1 : this.list.length - 1);
          break;
        case 40: // down
          e.preventDefault();
          // protect against out of bounds
          this.focusResult(highlightIndex < this.list.length - 1 ? highlightIndex + 1 : 0);
          break;
      }
    }
  }

  close () {
    if (this.state.isOpen) {
      this.setState({ isOpen: false });
      removeEventListener('click', this.close);
    }
  }

  focusResult (highlightIndex) {
    this.open();
    this.setState({ highlightIndex });
    this.list[highlightIndex].focus();
  }

  getLabel () {
    const opt = this.props.options.find(opt => opt.value === getValue(this));
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
    const isOpen = !this.state.isOpen;

    // if we're closing, the global click listener will handle
    if (isOpen) {
      this.setState({ isOpen }, () => {
        setTimeout(() => {
          // if our dropdown is opening, listen for clicks which should close it
          // jquery one method will stop listening after the first click
          // NOTE: this click handler is the main way the dropdown closes
          addEventListener('click', this.close);
        }, 0);
      });
    }
  }

  renderOptions () {
    if (!Array.isArray(this.props.options)) {
      console.warn('No options were supplied to Select.');
      return;
    }

    this.list = [];
    const ref = el => el && this.list.push(el);

    return this.props.options.map(({ label, value }) => {
      let classes = [ 'form__li-reset', 'form__dropdown-item' ];

      if (value === getValue(this)) classes.push('form__dropdown-item--is_selected');

      return (
        <li className={classes.join(' ')} key={value}>
          <button
            className="form__btn-reset form__dropdown-item-btn"
            onClick={this.handleClickItem}
            ref={ref}
            type="button"
            value={value}>{label}</button>
        </li>);
    });
  }

  render () {
    let classes = ['form__input', 'form__select', 'form-select', 'form__dropdown-wrapper'];

    if (this.state.isOpen) classes.push('form__dropdown-wrapper--is_open');

    return <div className={classes.join(' ')}>
      <button className="form__btn-reset form-select__value" onClick={this.handleClick} type="button">
        <span>{this.getLabel()}</span>
        <i className="icon icon-angle-down" />
      </button>
      <ul className="form__ul-reset form__dropdown">
        {this.renderOptions()}
      </ul>
    </div>;
  }
}
