import React from 'react';
import { findDOMNode } from 'react-dom';

import FormContext from '../config/FormContext';

import { getValue, isChecked, setValue, toggleValue } from './util';

import bindMethods from '../../util/bindMethods.js';
import callMe from '../../util/callMe.js';
import omit from '../../util/omit.js';
import renderIf from '../../util/renderIf.js';
import { addEventListener, removeEventListener } from '../../lib/domEvents.js';

// use this for identifying a field since we'll be setting some global listeners
// that we'll want to namespace uniquely
let id = 0;

// some field types prefer a label after the input
const FIELD_TYPES_LABEL_AFTER_INPUT = [
  'checkbox',
  'radio',
];

/**
 * Form field that adds nice form consistency, used to wrap around a form input
 * @class Field
 * @property {string} [className]
 * @property {object} [forwardedRef]
 * @property {number} [index] - when used within FormCollection
 * @property {string} [label] - label text for this field
 * @property {string} name - form field name, will be key in form data
 * @property {collection} [options] - for selectField or anything else that accepts
 * a predefined list of options to select from
 * @property {string} [theme] - defaults to "default", will generate class formatted
 * as form__field--theme_default
 * @property {string} type
 * @property {object|number|string} width - optional width
 * @return {jsx} div.form__field
 */
export default class Field extends React.Component {
  static contextType = FormContext;
  static defaultProps = { className: '', theme: 'default' };

  id = `field${id++}`;
  state = {
    hasFocus: false,
  };
  timeout;

  constructor (...args) {
    super(...args);
    bindMethods(this);
  }

  componentDidMount () {
    // listen for focus events
    // TODO: refactor to not require jquery
    // TODO: there's currently an oddity with SlickCarousel where it's preventing
    // focus from bubbling up, so this may not always fire :(
    addEventListener('focusin', this.onFocusIn);
    addEventListener('focusout', this.onFocusOut);
  }

  componentWillUnmount () {
    removeEventListener('focusin', this.onFocusIn);
    removeEventListener('focusout', this.onFocusOut);
    clearTimeout(this.timeout);
  }

  onFocusIn (e) {
    let field = findDOMNode(this);

    if (field.contains(e.target)) {
      this.setState({ hasFocus: true });
      callMe(this.context.state.form._onFieldFocus, { args: [ this.props.name, this.props.index ] });
      console.log('focus in');
    }
  }

  onFocusOut (e) {
    // async so that document.activeElement is updated
    this.timeout = setTimeout(() => {
      let field = findDOMNode(this);

      // check whether an element within this field is losing focus
      // but also check that this field doesn't still contain a focused element
      if (field.contains(e.target) && !field.contains(document.activeElement)) {
        this.setState({ hasFocus: false });
        callMe(this.context.state.form._onFieldBlur, { args: [ this.props.name, this.props.index ] });
      }
    }, 0);
  }

  formatClassName (modifierKey, modifierVal) {
    return `form__field--${modifierKey}_${modifierVal}`;
  }

  getErrors () {
    return this.context.state.form._getFieldErrors(this.props.name, this.props.index);
  }

  getProps () {
    return {
      ...omit('className', this.props),
      getValue: () => getValue(this),
      hasFocus: this.state.hasFocus,
      id: this.id,
      isChecked: () => isChecked(this),
      setValue: value => setValue(this, value),
      toggleValue: value => toggleValue(this, value),
    };
  }

  getWidthClassNames () {
    // allow for width prop to be variable data
    switch (typeof this.props.width) {
      case 'object':
        return Object
          .keys(this.props.width)
          .map(target => this.formatClassName(target, this.props.width[target]));
      case 'number':
      case 'string':
        return [this.formatClassName('all', this.props.width)];
      default:
        return [];
    }
  }

  renderErrors () {
    const errors = this.getErrors(this.props.index);
    if (!errors.length) return;

    return (<div className="form__field-errors">
      {errors.map(({ error }, i) => (
        <div className="form__field-error" key={i}>{error}</div>
      ))}
    </div>);
  }

  renderLabel () {
    if (this.props.label) {
      return <label className="form__label" htmlFor={this.id}>{this.props.label}</label>;
    }
  }

  render () {
    const Input = this.props.component;
    const { forwardedRef, type } = this.props;
    let classes = this.props.className.split(' ')
      .concat([
        'form__field',
        this.formatClassName('type', this.props.type),
        this.formatClassName('theme', this.props.theme),
        `${this.context.state.form.props.formName}__${this.props.name}`,
      ])
      .concat(this.getWidthClassNames());

    // add focus class
    if (this.state.hasFocus) classes.push(this.formatClassName('has', 'focus'));

    // add errors class
    if (this.getErrors().length) classes.push(this.formatClassName('has', 'errors'));
    else classes.push(this.formatClassName('no', 'errors'));

    // TODO: add modifiers for things like has_value, etc
    return (
      <div className={classes.join(' ')}>
        {renderIf(!FIELD_TYPES_LABEL_AFTER_INPUT.includes(type), this.renderLabel)}
        {this.renderErrors()}
        <Input ref={forwardedRef} {...this.getProps()} />
        {renderIf(FIELD_TYPES_LABEL_AFTER_INPUT.includes(type), this.renderLabel)}
        {this.props.children}
      </div>
    );
  }
}
