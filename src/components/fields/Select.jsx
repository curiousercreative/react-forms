import React from 'react';
import exists from '../../util/exists.js';

import bindMethods from '../../util/bindMethods.js';
import { addEventListener, removeEventListener } from '../../lib/domEvents.js';

const QUERY_KEY_WINDOW = 1000;

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
  static defaultProps = {
    optionKeySelector (option) {
      return option.value;
    },
  }

  id = `select${id++}`;
  inputRef = React.createRef();
  list = [];
  query = '';
  queryLastUpdated = 0;
  state = {
    highlightIndex: -1,
    isOpen: false,
  };

  constructor (...args) {
    super(...args);
    bindMethods(this);
  }

  componentDidMount () {
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
    if (!this.props.disabled) this.open();
  }

  handleClickItem (e) {
    // this.props.setValue(e.target.value);
    const val = this.props.options.find(({ value }) => String(value) === e.target.value).value;
    this.props.setValue(val);
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
        default: // alphanumeric
          const key = e.key.toLowerCase();
          if (key.match(/[a-z0-9]/)) this.onQueryKey(key);
      }
    }
  }

  onQueryKey (char) {
    const now = Date.now();
    this.query = now - this.queryLastUpdated <= QUERY_KEY_WINDOW
      ? this.query + char
      : char;

    this.queryLastUpdated = now;

    // focus on a result if possible
    const index = this.props.options.findIndex(({ label }) => label.toLowerCase().startsWith(this.query));
    if (index > -1) this.focusResult(index);
  }

  close () {
    if (this.state.isOpen) {
      this.setState({ isOpen: false });
      removeEventListener('click', this.close);
    }
  }

  focus () {
    this.inputRef.current.focus();

    // NOTE: async to band-aid a race condition between this and componentDidUpdate
    setTimeout(() => this.open(), 60);
  }

  focusResult (highlightIndex) {
    this.open();
    this.setState({ highlightIndex });
    this.list[highlightIndex].focus();
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
    // short-circuit if already open
    if (this.state.isOpen) return;

    this.setState({ isOpen: true }, () => {
      // NOTE: async to band-aid a race condition between this and componentDidUpdate
      setTimeout(() => {
        // if our dropdown is opening, listen for clicks which should close it
        // NOTE: this click handler is the main way the dropdown closes
        addEventListener('click', this.close);
      }, 0);
    });
  }

  renderOptions () {
    if (!Array.isArray(this.props.options)) {
      console.warn('No options were supplied to Select.');
      return;
    }

    this.list = [];
    const ref = el => el && this.list.push(el);

    return this.props.options.map(opt => {
      const { label, value } = opt;
      let classes = [ 'form__li-reset', 'form__dropdown-item' ];

      if (value === this.props.getValue()) classes.push('form__dropdown-item--is_selected');

      return (
        <li className={classes.join(' ')} key={this.props.optionKeySelector(opt)}>
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
    let classes = ['form__select', 'form-select', 'form__dropdown-wrapper'];

    if (this.state.isOpen) classes.push('form__dropdown-wrapper--is_open');
    if (this.props.disabled) classes.push('form-select--disabled');

    return <div className={classes.join(' ')}>
      <button ref={this.inputRef} className="form__btn-reset form-select__value" onClick={this.handleClick} type="button">
        <span>{this.getLabel()}</span>
        <i className="icon icon-angle-down" />
      </button>
      <ul className="form__ul-reset form__dropdown">
        {this.renderOptions()}
      </ul>
    </div>;
  }
}
