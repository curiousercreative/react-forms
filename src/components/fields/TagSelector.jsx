import React from 'react';
import { findDOMNode } from 'react-dom';

import exists from '../../util/exists.js';
import renderIf from '../../util/renderIf.js';

import AutosizeInput from './AutosizeInput.jsx';

import bindMethods from '../../util/bindMethods.js';
import { addEventListener, removeEventListener } from '../../lib/domEvents.js';

let id = 0;
/**
 * a custom dropdown/select input
 * @class TagSelector
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
export default class TagSelector extends React.Component {
  static defaultProps = {
    optionKeySelector (option) {
      return option.value;
    },
  }

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

    this.state.isOpen = !exists(this.props.getValue());

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

    this.props.toggleValue(opt.value);
  }

  handleClickOpen () {
    this.open();
  }

  handleClickTagRemove (e) {
    e.nativeEvent.stopImmediatePropagation();
    const opt = this.props.options[Number(e.target.value)];

    this.props.toggleValue(opt.value);
  }

  handleFocus () {
    this.focus();
  }

  // TODO: this and other methods are modified copies from SearchField.jsx
  // look into having the code shared?
  handleKeys (e) {
    const { highlightIndex, query } = this.state;
    const value = this.props.getValue();

    // don't do anything if not focused
    if (!this.state.isOpen) return;

    if (this.list.length) {
      switch (e.which) {
        case 27: // escape
          // if search was entered, clear it and refocus on the input to allow
          // a new search
          if (query) {
            this.setState({ query: '' });
            this.refs.input.focus();
          }
          // no search, close everything
          else this.close();
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

    // if our query is empty, we've got tags and user is backspacing...
    if (!this.state.query && value.length && e.which === 8) this.popTag();
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

  focus () {
    // open the dropdown (and focus on our text input)
    this.open();
  }

  focusResult (highlightIndex) {
    // this.open();
    this.setState({ highlightIndex });
    this.list[highlightIndex].focus();
  }

  getLabel () {
    const label = this.getSelectedIndexes(this.props.getValue())
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
    return new Promise(resolve => {
      if (this.state.isOpen) return resolve();

      this.setState({ isOpen: true }, () => setTimeout(resolve, 0));
    })
      .then(() => {
        // NOTE: this click handler is the main way the dropdown closes
        // add event listeners
        addEventListener('click', this.handleWindowClick);
        addEventListener('keydown', this.handleKeys);

        // focus on the actual text input
        if (this.refs.input) this.refs.input.focus();
      });
  }

  /**
   * removes the (visually) last tag
   */
  popTag () {
    const indexes = this.getSelectedIndexes(this.props.getValue());
    const index = indexes[indexes.length - 1];
    const option = this.props.options[index];
    this.props.toggleValue(option.value);
  }

  renderOptions () {
    if (!Array.isArray(this.props.options)) {
      console.warn('No options were supplied to Select.');
      return;
    }

    this.list = [];
    const ref = el => el && this.list.push(el);

    const query = this.state.query.toLowerCase();
    const selectedIndexes = this.getSelectedIndexes(this.props.getValue());

    return (
      <ul className="form__ul-reset form__dropdown">
        {this.getOptionsWithIndexes(this.props.options)
          // if a query has been entered, filter the options!
          .filter(({ label }) => !query || label.toLowerCase().includes(query))
          .map(opt => {
            const { label, i, value } = opt;
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

  renderTags () {
    return (
      <ul className="form__ul-reset form-tag-selector__tags">
        {this.getSelectedIndexes(this.props.getValue()).map(i => {
          const opt = this.props.options[i];

          return (
            <li className="form__li-reset form-tag-selector__tag" key={this.props.optionKeySelector(opt)}>
              {opt.label}
              <button className="form__btn-reset form-tag-selector__tag-remove" onClick={this.handleClickTagRemove} type="button" value={i}>X</button>
            </li>
          );
        })}
      </ul>
    );
  }

  render () {
    let classes = ['form__tag-selector', 'form-tag-selector', 'form__dropdown-wrapper'];

    if (this.state.isOpen) {
      classes.push('form-tag-selector--is_open');
      classes.push('form__dropdown-wrapper--is_open');
    }
    if (this.props.disabled) classes.push('form-tag-selector--disabled');

    return <div className={classes.join(' ')}>
      {renderIf(this.state.isOpen, () => (
        <div className="form-tag-selector__input-wrapper">
          {renderIf(this.props.getValue().length, this.renderTags)}
          <AutosizeInput
            className="form__input-reset form-tag-selector__input"
            onChange={this.handleChange}
            placeholder="Type to filter..."
            ref="input"
            type="text"
            value={this.state.query} />
        </div>
      ), () => (
        <button
          className="form__btn-reset form-tag-selector__value"
          disabled={this.props.disabled}
          onClick={this.handleClickOpen}
          onFocus={this.handleFocus}
          type="button">
          <span>{this.getLabel()}</span>
        </button>
      ))}
      {renderIf(this.state.isOpen, this.renderOptions)}
    </div>;
  }
}
