import React from 'react';
import memo from 'memoize-one';

import curry from '../../util/curry.js';
import exists from '../../util/exists.js';
import renderIf from '../../util/renderIf.js';

import AutosizeInput from './components/AutosizeInput.jsx';
import DropdownWrapper from './components/DropdownWrapper.jsx';

import bindMethods from '../../util/bindMethods.js';
import { addEventListener, removeEventListener } from '../../lib/domEvents.js';

/**
 * a custom dropdown + text input for filtering dropdown options
 * @class TagSelector
 * @property {boolean} [disabled]
 * @property {boolean} [hasFocus]
 * @property {string} id
 * @property {string} name
 * @property {object[]} options
 * @property {string} options[].label
 * @property {string} options[].value
 * @property {function} [optionKeySelector]
 * @property {string} [placeholder]
 * @property {boolean} [resetOnSelect]
 *
 * TEST CASES:
 * Given the dropdown is closed, field should display labels of selected options
 * Given the dropdown is open, dropdown should close when user clicks outside of field
 * Given the dropdown is open, dropdown should close when user focus leaves component
 * Given the dropdown is open, "value" should be toggled when user selects item from dropdown
 * Given the dropdown is open, up and down keys should navigate dropdown items
 * Given the dropdown is open, pressing enter/space should select dropdown item
 * Given the dropdown is open, with query text entered, pressing escape should reset query text
 * Given the dropdown is open, without query text entered, pressing escape should hide dropdown
 */
export default class TagSelector extends React.Component {
  static defaultProps = {
    optionKeySelector: opt => opt.value,
    resetOnSelect: false,
  };

  inputRef = React.createRef();
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
    this.inputRef.current.focus();
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
      .then(() => isOpen && this.inputRef.current.focus());
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
              id={this.props.id}
              onChange={this.handleChange}
              onKeyDown={this.handleQueryKeys}
              placeholder="Type to filter..."
              ref={this.inputRef}
              type="text"
              value={this.state.query} />
          </div>
        ))}
        <button
          className="form__btn-reset form-tag-selector__value"
          disabled={this.props.disabled}
          id={this.props.id}
          onClick={this.handleClick}
          ref={this.props.forwardedRef}
          tabIndex={this.state.isOpen ? '-1' : 0}
          type="button">
          <span>{this.getLabel()}</span>
        </button>
      </DropdownWrapper>
    );
  }
}
