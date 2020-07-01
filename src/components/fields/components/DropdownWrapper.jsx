import React from 'react';
import { findDOMNode } from 'react-dom';
import memo from 'memoize-one';

import bindMethods from '../../../util/bindMethods.js';
import renderIf from '../../../util/renderIf.js';

const QUERY_KEY_REGEX = /[a-z0-9]/;
const QUERY_KEY_WINDOW = 1000;

/**
 * @class DropdownWrapper
 * @property {string} [className]
 * @property {boolean} isOpen
 * @property {function} onSelect
 * @property {object[]} options
 * @property {string} options[].label
 * @property {string} options[].value
 * @property {function} [optionKeySelector]
 * @property {function} [prepareOptions] - given options collection, returned collection is rendered
 * @property {function} setIsOpen
 * @property {array|any} value
 */
export default class DropdownWrapper extends React.Component {
  static defaultProps = {
    className: '',
    optionKeySelector: opt => opt.value,
    prepareOptions: opts => opts,
  };

  highlightIndex = -1;
  list = [];
  query = '';
  queryLastUpdated = 0;

  constructor (...args) {
    super(...args);
    bindMethods(this);

    this.getOptions = memo(this.getOptions);
    this.updateIsOpen = memo(this.updateIsOpen);
  }

  componentDidUpdate () {
    this.updateIsOpen(this.props.isOpen);
  }

  handleClickItem (e) {
    const opt = this.props.options[Number(e.target.value)];

    this.props.onSelect(opt.value);
  }

  handleKeys (e) {
    const { highlightIndex, list } = this;

    // don't do anything if not open with options
    if (this.props.isOpen && list.length) {
      switch (e.which) {
        case 27: // escape
          this.close();
          break;
        case 38: // up
          e.preventDefault();
          // protect against out of bounds
          this.focusResult(highlightIndex > 0 ? highlightIndex - 1 : list.length - 1);
          break;
        case 40: // down
          e.preventDefault();
          // protect against out of bounds
          this.focusResult(highlightIndex < list.length - 1 ? highlightIndex + 1 : 0);
          break;
        default: // alphanumeric
          // we're assuming that if key events originate from an input, they are
          // being handled elsewhere
          if (!(e.target instanceof window.HTMLInputElement)) {
            const key = e.key.toLowerCase();
            if (key.match(QUERY_KEY_REGEX)) this.onQueryKey(key);
          }
      }
    }
  }

  handleWindowClickOrFocus (nativeEvent) {
    if (this.props.isOpen && !findDOMNode(this).contains(nativeEvent.target)) this.close();
  }

  onClose () {
    removeEventListener('click', this.handleWindowClickOrFocus);
    removeEventListener('keydown', this.handleKeys);
  }

  onOpen () {
    // add event listeners
    addEventListener('click', this.handleWindowClickOrFocus);
    addEventListener('keydown', this.handleKeys);
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
    this.props.setIsOpen(false);
  }

  focusResult (highlightIndex) {
    this.highlightIndex = highlightIndex;
    this.list[highlightIndex].focus();
  }

  getOptions (options, prepare) {
    return prepare(this.getOptionsWithIndexes(options));
  }

  getOptionsWithIndexes (options) {
    return options.map((opt, i) => ({ ...opt, i }));
  }

  getSelectedIndexes (values) {
    values = Array.isArray(values) ? values : [ values ];

    return values
      .map(v => this.props.options.findIndex(o => o.value === v))
      .filter(i => i > -1);
  }

  open () {
    this.props.setIsOpen(true);
  }

  updateIsOpen (isOpen) {
    return isOpen ? this.onOpen() : this.onClose();
  }

  renderOptions () {
    if (!Array.isArray(this.props.options)) {
      console.warn('No options were supplied to DropdownWrapper.');
      return;
    }

    this.list = [];
    const ref = el => el && this.list.push(el);

    const selectedIndexes = this.getSelectedIndexes(this.props.value);

    return (
      <ul className="form__ul-reset form__dropdown">
        {this.getOptions(this.props.options, this.props.prepareOptions)
          .map(opt => {
            const { label, i } = opt;
            let classes = [ 'form__li-reset', 'form__dropdown-item' ];

            if (selectedIndexes.includes(i)) classes.push('form__dropdown-item--is_selected');

            return (
              <li className={classes.join(' ')} key={this.props.optionKeySelector(opt)}>
                <button
                  className="form__btn-reset"
                  onClick={this.handleClickItem}
                  ref={ref}
                  type="button"
                  value={i}>{label}</button>
              </li>);
          })
        }
      </ul>
    );
  }

  render () {
    let classes = this.props.className.split(' ').concat('form__dropdown-wrapper');

    if (this.props.isOpen) classes.push('form__dropdown-wrapper--is_open');

    return <div className={classes.join(' ')}>
      {this.props.children}
      {renderIf(this.props.isOpen, this.renderOptions)}
    </div>;
  }
}
