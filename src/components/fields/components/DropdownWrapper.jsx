import React from 'react';
import memo from 'memoize-one';

import bindMethods from '../../../util/bindMethods.js';
import exists from '../../../util/exists.js';
import renderIf from '../../../util/renderIf.js';
import timeoutPromise from '../../../util/timeoutPromise.js';
import { addEventListener, removeEventListener } from '../../../lib/domEvents.js';

const EVENT_TIMEOUT = 0;
const QUERY_KEY_REGEX = /[a-z0-9]/;
const QUERY_KEY_WINDOW = 1000;

/**
 * @class DropdownWrapper
 * @property {string} [className]
 * @property {boolean} [focusOnOpen = true]
 * @property {object} [focusRef] React ref to DOM element to receive focus
 * @property {boolean} [hasFocus]
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
    focusOnOpen: true,
    optionKeySelector: opt => opt.value,
    prepareOptions: opts => opts,
  };

  hasFocus = false;
  highlightIndex = -1;
  list = [];
  query = '';
  queryLastUpdated = 0;
  ref = React.createRef();
  timeout;

  constructor (...args) {
    super(...args);
    bindMethods(this);

    this.getFocusHandlers = memo(this.getFocusHandlers);
    this.getOptions = memo(this.getOptions);
    this.updateIsOpen = memo(this.updateIsOpen);
  }

  componentDidMount () {
    addEventListener('keydown', this.handleKeys);
  }

  componentDidUpdate () {
    const { isOpen } = this.props;

    // isOpen is always managed by parent, respond to updates
    this.updateIsOpen(isOpen);
  }

  componentWillUnmount () {
    removeEventListener('keydown', this.handleKeys);
  }

  handleBlur (e) {
    // below, we dispatch an untrusted event that we don't want to handle
    if (!e.isTrusted) return;

    // stop the bubble as we're managing focus for ourselves and don't want Field.jsx
    // conflicting
    e.stopPropagation();

    // wait a tick to allow our focus handler to cancel us as described here:
    // https://medium.com/@jessebeach/dealing-with-focus-and-blur-in-a-composite-widget-in-react-90d3c3b49a9b
    this.timeout = setTimeout(() => {
      // close the dropdown
      this.close();

      // if we were blurred but nothing else was focused, don't proceed to release focus
      if (document.activeElement === document.body) return;

      // create a synthetic "blur" event that bubbles and dispatch
      const blurEvent = new Event('blur', { bubbles: true });
      this.ref.current.dispatchEvent(blurEvent);
      this.hasFocus = false;
    }, EVENT_TIMEOUT);
  }

  handleClickItem (e) {
    const opt = this.props.options[Number(e.target.value)];

    this.props.onSelect(opt.value);
  }

  handleFocus (e) {
    // no need to bubble if focus remain within our control
    if (this.hasFocus) e.stopPropagation();

    // cancel our blur handler since another target within our control received focus
    clearTimeout(this.timeout);

    this.hasFocus = true;
  }

  handleKeys (e) {
    const { highlightIndex, list } = this;

    // dropdown is open with options
    if (this.props.isOpen && list.length) {
      switch (e.which) {
        case 27: // escape
          this.close(true);
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
    // key bindings for dropdown closed but field focused
    else if (!this.props.isOpen && this.hasFocus) {
      switch (e.which) {
        case 13: // enter
        case 32: // space
        case 38: // up
        case 40: // down
          e.preventDefault();
          this.open();
      }
    }
  }

  onClose () {}

  onOpen () {
    if (this.props.focusOnOpen) {
      const selectedIndexes = this.getSelectedIndexes(this.props.value);
      const highlightIndex = selectedIndexes.length === 1
        ? selectedIndexes[0]
        : 0;

      // upon opening, focus on the only selected option or the first option
      this.focusResult(highlightIndex);
    }
  }

  onOptionRef (el) {
    if (el) this.list.push(el);
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

  close (holdFieldFocus = false) {
    if (holdFieldFocus && this.props.focusRef) this.props.focusRef.current.focus();
    else this.hasFocus = false;
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
                  ref={this.onOptionRef}
                  tabIndex="-1"
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

    return <div
      className={classes.join(' ')}
      onBlur={this.handleBlur}
      onFocus={this.handleFocus}
      ref={this.ref}>
      {this.props.children}
      {renderIf(this.props.isOpen, this.renderOptions)}
    </div>;
  }
}
