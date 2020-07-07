import React from 'react';
import memo from 'memoize-one';

import curry from '../../util/curry.js';
import exists from '../../util/exists.js';
import renderIf from '../../util/renderIf.js';

import AutosizeInput from './components/AutosizeInput.jsx';
import DropdownWrapper from './components/DropdownWrapper.jsx';

import bindMethods from '../../util/bindMethods.js';
import { addEventListener, removeEventListener } from '../../lib/domEvents.js';

let id = 0;
/**
 * a custom dropdown/select input
 * @class TagSelector
 * @property {boolean} [disabled]
 * @property {boolean} [hasFocus]
 * @property {string} name
 * @property {object[]} options
 * @property {string} options[].label
 * @property {string} options[].value
 * @property {function} [optionKeySelector]
 * @property {string} [placeholder]
 * @property {boolean} [resetOnSelect]
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
    optionKeySelector: opt => opt.value,
    resetOnSelect: false,
  };

  focusRef = React.createRef();
  id = `tag-selector${id++}`;
  state = {
    isOpen: false,
    query: '',
  };

  constructor (...args) {
    super(...args);
    bindMethods(this);

    this.prepareOptions = memo(curry(this.prepareOptions));
    this.updateHasFocus = memo(this.updateHasFocus);
  }

  componentDidMount () {
    addEventListener('keydown', this.handleKeys);
  }

  componentDidUpdate () {
    this.updateHasFocus(this.props.hasFocus);
  }

  componentWillUnmount () {
    removeEventListener('keydown', this.handleKeys);
  }

  handleChange (e) {
    const { value } = e.target;

    this.setState({ query: value });
  }

  handleClick () {
    this.setIsOpen(true);
  }

  handleClickTagRemove (e) {
    e.nativeEvent.stopImmediatePropagation();
    const opt = this.props.options[Number(e.target.value)];

    this.props.toggleValue(opt.value);
  }

  handleKeys (e) {
    // window event listener, be careful to only respond to keys when focused/open
    if (!this.state.isOpen) return;

    switch (e.which) {
      case 27: // escape
        // if search was entered, reset and refocus for next query
        if (this.state.query) {
          this.resetQuery();

          // this prevents DropdownWrapper from closing as part of its key listener
          e.stopImmediatePropagation();
        }
        break;
    }
  }

  handleQueryKeys (e) {
    switch (e.which) {
      case 8: // backspace
        // if our query is empty, we've got tags and user is backspacing...
        if (!this.state.query && this.props.getValue().length) this.popTag();
        break;
      case 13: // enter
        // select first option
        this.select(this.getOptions()[0].value);
        break;
    }
  }

  onRef (el) {
    this.focusRef.current = el;
    this.props.forwardedRef.current = el;
  }

  getLabel () {
    const label = this.getSelectedIndexes(this.props.getValue())
      .map(i => this.props.options[i])
      .filter(exists)
      .map(o => o.label)
      .join(', ');

    return label || this.props.placeholder || '';
  }

  getOptions () {
    return this.prepareOptions(this.state.query, this.props.options);
  }

  getOptionsWithIndexes (options) {
    return options.map((opt, i) => ({ ...opt, i }));
  }

  getSelectedIndexes (values) {
    return values
      .map(v => this.props.options.findIndex(o => o.value === v))
      .filter(i => i > -1);
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

  prepareOptions (query, options) {
    // if a query has been entered, filter the options!
    return options.filter(({ label }) => !query || label.toLowerCase().includes(query));
  }

  resetQuery () {
    this.setState({ query: '' });
    this.props.forwardedRef.current.focus();
  }

  select (value) {
    this.props.toggleValue(value);
    if (this.props.resetOnSelect) this.resetQuery();
  }

  setIsOpen (isOpen) {
    if (isOpen === this.state.isOpen) return Promise.resolve();

    // return new Promise(resolve => this.setState({ isOpen }, () => setTimeout(resolve, 0)))
    return new Promise(resolve => this.setState({ isOpen }, resolve))
      // focus on our query text input when opening
      .then(() => isOpen && this.props.forwardedRef.current.focus());
  }

  updateHasFocus (hasFocus) {
    // if we gained focus and we're not already open
    if (hasFocus && !this.state.isOpen) this.setIsOpen(true);
  }

  renderTags () {
    return (
      <ul className="form__ul-reset form-tag-selector__tags">
        {this.getSelectedIndexes(this.props.getValue())
          // map to options with indexes
          .map(i => ({ ...this.props.options[i], i }))
          // sort on label
          .sort((a, b) => a.label > b.label ? 1 : -1)
          .map(opt => (
            <li className="form__li-reset form-tag-selector__tag" key={this.props.optionKeySelector(opt)}>
              {opt.label}
              <button className="form__btn-reset form-tag-selector__tag-remove" onClick={this.handleClickTagRemove} type="button" value={opt.i}>X</button>
            </li>
          ))
        }
      </ul>
    );
  }

  render () {
    let classes = ['form__tag-selector', 'form-tag-selector'];

    if (this.props.disabled) classes.push('form-tag-selector--disabled');

    return (
      <DropdownWrapper
        className={classes.join(' ')}
        focusOnOpen={false}
        focusRef={this.focusRef}
        hasFocus={this.props.hasFocus}
        isOpen={this.state.isOpen}
        onSelect={this.select}
        options={this.props.options}
        prepareOptions={this.prepareOptions(this.state.query)}
        setIsOpen={this.setIsOpen}
        value={this.props.getValue()}>
        {renderIf(this.state.isOpen, () => (
          <div className="form-tag-selector__input-wrapper">
            {renderIf(this.props.getValue().length, this.renderTags)}
            <AutosizeInput
              className="form__input-reset form-tag-selector__input"
              onChange={this.handleChange}
              onKeyDown={this.handleQueryKeys}
              placeholder="Type to filter..."
              ref={this.props.forwardedRef}
              type="text"
              value={this.state.query} />
          </div>
        ))}
        <button
          className="form__btn-reset form-tag-selector__value"
          disabled={this.props.disabled}
          onClick={this.handleClick}
          ref={this.onRef}
          tabIndex={this.state.isOpen ? '-1' : 0}
          type="button">
          {this.getLabel()}
        </button>
      </DropdownWrapper>
    );
  }
}
