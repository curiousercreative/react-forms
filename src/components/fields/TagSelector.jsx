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
    optionKeySelector: opt => opt.value,
  };

  id = `tag-selector${id++}`;
  inputRef = React.createRef();
  state = {
    isOpen: false,
    query: '',
  };

  constructor (...args) {
    super(...args);
    bindMethods(this);

    this.state.isOpen = !exists(this.props.getValue());

    this.prepareOptions = memo(curry(this.prepareOptions));
  }

  componentDidMount () {
    addEventListener('focusin', this.handleWindowClickOrFocus);
  }

  componentWillUnmount () {
    removeEventListener('keydown', this.handleKeys);
    removeEventListener('click', this.handleWindowClickOrFocus);
    removeEventListener('focusin', this.handleWindowClickOrFocus);
  }

  handleChange (e) {
    const { value } = e.target;

    this.setState({ query: value });
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

  handleKeys (e) {
    const { query } = this.state;
    const value = this.props.getValue();

    // don't do anything if not focused
    if (!this.state.isOpen) return;

    switch (e.which) {
      case 8: // backspace
        // if our query is empty, we've got tags and user is backspacing...
        if (!this.state.query && value.length) this.popTag();
        break;
      case 27: // escape
        // if search was entered, clear it and refocus on the input to allow
        // a new search
        if (query) {
          this.setState({ query: '' });
          this.inputRef.current.focus();

          // this is an attempt to block DropdownWrapper from closing as part of its
          // key listener
          e.stopImmediatePropagation();
        }
        break;
    }
  }

  close () {
    if (!this.state.isOpen) return;

    removeEventListener('keydown', this.handleKeys);

    this.setState({ isOpen: false });
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
        addEventListener('keydown', this.handleKeys);
        // focus on the actual text input
        if (this.inputRef.current) this.inputRef.current.focus();
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

  prepareOptions (query, options) {
    // if a query has been entered, filter the options!
    return options.filter(({ label }) => !query || label.toLowerCase().includes(query));
  }

  setIsOpen (isOpen) {
    if (isOpen !== this.state.isOpen) this.setState({ isOpen });
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
    let classes = ['form__tag-selector', 'form-tag-selector'];

    if (this.props.disabled) classes.push('form-tag-selector--disabled');

    return (
      <DropdownWrapper
        className={classes.join(' ')}
        isOpen={this.state.isOpen}
        onSelect={this.props.toggleValue}
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
              placeholder="Type to filter..."
              ref={this.inputRef}
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
            {this.getLabel()}
          </button>
        ))}
      </DropdownWrapper>
    );
  }
}
