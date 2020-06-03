import React from 'react';
import { findDOMNode } from 'react-dom';
import memo from 'memoize-one';
import exists from '../../util/exists.js';
import renderIf from '../../util/renderIf.js';

import bindMethods from '../../util/bindMethods.js';
import { addEventListener, removeEventListener } from '../../lib/domEvents.js';

import FormContext from '../config/FormContext.js';
import getValue from './util/getValue.js';
import toggleValue from './util/toggleValue.js';

let id = 0;
/**
 * a custom dropdown/select input
 * @class TagSelector
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
export default class TagSelector extends React.Component {
  static contextType = FormContext;

  id = `tag-selector${id++}`;
  list = [];
  options = {};
  state = {
    highlightIndex: -1,
    isOpen: false,
    query: '',
  };

  constructor (...args) {
    super(...args);
    bindMethods(this);

    this.state.isOpen = !exists(getValue(this));

    // TODO: figure out why these memoized functions don't update with incoming props
    // this.getOptionsWithIndexes = memo(this.getOptionsWithIndexes);
    // this.getSelectedIndexes = memo(this.getSelectedIndexes);
  }

  componentDidUpdate (props) {
    // if we lost focus and we're open, close
    if (!this.props.hasFocus && props.hasFocus) this.close();
  }

  componentWillUnmount () {
    removeEventListener('keydown', this.handleKeys);
    removeEventListener('click', this.handleWindowClick);
  }

  handleChange (e) {
    const { value } = e.target;

    this.setState({ query: value });
  }

  handleClickItem (e) {
    const opt = this.props.options[Number(e.target.value)];

    toggleValue(this, opt.value);
  }

  handleClickOpen () {
    this.open();
  }

  handleClickTagRemove (e) {
    e.nativeEvent.stopImmediatePropagation();
    const opt = this.props.options[Number(e.target.value)];

    toggleValue(this, opt.value);
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

  handleWindowClick (nativeEvent) {
    if (!findDOMNode(this).contains(nativeEvent.target)) this.close();
    // if (findDOMNode(this).contains(e.target)) this.open();
    // else this.close();
  }

  close () {
    if (!this.state.isOpen) return;

    this.setState({ isOpen: false });
    removeEventListener('click', this.handleWindowClick);
    removeEventListener('keydown', this.handleKeys);
  }

  focusResult (highlightIndex) {
    this.open();
    this.setState({ highlightIndex });
    this.list[highlightIndex].focus();
  }

  getLabel () {
    const label = this.getSelectedIndexes(getValue(this))
      .map(i => this.props.options[i])
      .filter(exists)
      .map(o => o.label)
      .join(', ');

    return label || this.props.placeholder || '';
  }

  getOptionsWithIndexes (options) {
    return options.map((opt, i) => ({ ...opt, i }));
  }

  getSelectedIndexes (values) {
    return values
      .map(v => this.props.options.findIndex(o => o.value === v))
      .filter(i => i > -1)
      .sort();
  }

  open () {
    if (this.state.isOpen) return;

    this.setState({ isOpen: true }, () => {
      setTimeout(() => {
        // NOTE: this click handler is the main way the dropdown closes
        addEventListener('click', this.handleWindowClick);
        addEventListener('keydown', this.handleKeys);
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

    const query = this.state.query.toLowerCase();
    const selectedIndexes = this.getSelectedIndexes(getValue(this));

    return (
      <ul className="form__dropdown">
        {this.getOptionsWithIndexes(this.props.options)
          // if a query has been entered, filter the options!
          .filter(({ label }) => !query || label.toLowerCase().includes(query))
          .map(({ label, i, value }) => {
            let classes = ['form__dropdown-item'];

            if (selectedIndexes.includes(i)) classes.push('form__dropdown-item--is_selected');

            return (
              <li className={classes} key={value}>
                <button
                  className="btn-reset"
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

  renderTags () {
    return (
      <ul className="form-tag-selector__tags">
        {this.getSelectedIndexes(getValue(this)).map(i => {
          const opt = this.props.options[i];

          return (
            <li className="form-tag-selector__tag" key={opt.value}>
              {opt.label}
              <button onClick={this.handleClickTagRemove} type="button" value={i}>X</button>
            </li>
          );
        })}
      </ul>
    );
  }

  render () {
    let classes = ['form__input', 'form__tag-selector', 'form-tag-selector', 'form__dropdown-wrapper'];

    if (this.state.isOpen) {
      classes.push('form-tag-selector--is_open');
      classes.push('form__dropdown-wrapper--is_open');
    }

    return <div className={classes.join(' ')}>
      {renderIf(this.state.isOpen, () => (
        <div className="form-tag-selector__input-wrapper">
          {renderIf(getValue(this).length, this.renderTags)}
          <input
            className="form-tag-selector__input"
            onChange={this.handleChange}
            placeholder="Type to filter..."
            type="text"
            value={this.state.query} />
        </div>
      ), () => (
        <button className="form-tag-selector__value" onClick={this.handleClickOpen} type="button">
          <span>{this.getLabel()}</span>
        </button>
      ))}
      {renderIf(this.state.isOpen, this.renderOptions)}
    </div>;
  }
}
