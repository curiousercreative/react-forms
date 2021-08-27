import React from 'react';
import memo from 'memoize-one';

import FormContext from '../config/FormContext';

import { getFieldTopic, getValue, isChecked, setValue, toggleValue } from './util';

import bindMethods from '../../util/bindMethods.js';
import omit from '../../util/omit.js';
import renderIf from '../../util/renderIf.js';

// for tracking which field has focus since we aren't strictly using document.activeElement
let activeField;
// for generating a global namespace to allow for event listeners and HTMLLabelElement.for attribute
let id = 0;

// some field types prefer a label after the input
const FIELD_TYPES_LABEL_AFTER_INPUT = [
  'checkbox',
  'radio',
];

/**
 * Form field that adds nice form consistency and focus managementused to wrap around a form input
 * @class Field
 * @property {string} [className]
 * @property {React.Component} component
 * @property {object} [forwardedRef]
 * @property {number} [index] - when used within FormCollection
 * @property {string} [label] - label text for this field
 * @property {string} name - form field name, will be key in form data
 * @property {function} [onChange] - receives field value and { index, name, value, context }
 * @property {collection} [options] - for selectField or anything else that accepts
 * a predefined list of options to select from
 * @property {boolean} [retainsFocus = false] whether to consider this field to still
 * be active after blur if nothing else has acquired focus
 * @property {string} [theme] - defaults to "default", will generate class formatted
 * as form__field--theme_default
 * @property {string} type
 * @property {object|number|string} width - optional width
 * @return {jsx} div.form__field
 */
export default class Field extends React.Component {
  static contextType = FormContext;
  static defaultProps = {
    className: '',
    retainsFocus: false,
    theme: 'default',
  };

  id = `field${id++}`;
  state = {
    hasFocus: false,
  };
  timeout;

  constructor (...args) {
    super(...args);
    bindMethods(this);

    this.inputRef = this.props.forwardedRef || React.createRef();
    this.updateHasFocus = memo(this.updateHasFocus);
  }

  componentDidMount () {
    this.context.pubsub.on(getFieldTopic(this.props.name, 'updated'), ({ index, name, value, context }) => {
      if (typeof this.props.onChange === 'function') this.props.onChange(value, { index, name, value, context });
    });
  }

  componentWillUnmount () {
    clearTimeout(this.timeout);
  }

  handleBlur () {
    // wait a tick to allow our focus handler to cancel us as described here:
    // https://medium.com/@jessebeach/dealing-with-focus-and-blur-in-a-composite-widget-in-react-90d3c3b49a9b
    this.timeout = setTimeout(() => {
      // if we were blurred but nothing else was focused and we're flagged to retain focus
      // don't release focus, instead attempt to refocus
      if (this.props.retainsFocus && document.activeElement === document.body) this.focus();
      else this.updateHasFocus(false);
    }, 0);
  }

  handleFocus () {
    clearTimeout(this.timeout);
    this.updateHasFocus(true);
  }

  focus () {
    this.updateHasFocus(true);

    try {
      this.inputRef.current.focus();
    } catch (e) {
      console.warn(new Error(`Unable to focus form field ${this.props.name}${this.props.index}`));
    }
  }

  formatClassName (modifierKey, modifierVal) {
    return `form__field--${modifierKey}_${modifierVal}`;
  }

  /**
   * @return {string[]}
   */
  getErrors () {
    const { index, name } = this.props;
    const errors = this.context.state.errors;

    return (typeof index === 'number' ? errors[index] : errors)
      .filter(e => e.name === name)
      .map(({ error }) => error);
  }

  getProps () {
    // TODO: look into render optimization (memoization or otherwise)
    return {
      ...omit('className', this.props),
      getValue: () => getValue(this),
      hasFocus: this.state.hasFocus,
      id: this.id,
      isChecked: isChecked(this),
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

  hasValue () {
    const value = getValue(this);

    switch (typeof value) {
      case 'object':
        if (Array.isArray(value)) return value.length > 0;
        if (value === null) return false;
        return true;
      case 'string':
        return value.length > 0;
      case 'undefined':
        return false;
      default:
        return true;
    }
  }

  updateHasFocus (hasFocus) {
    // short circuit if values already match (necessary for first memoized call)
    if (this.state.hasFocus === hasFocus) return;

    if (hasFocus) {
      // notify previously activeField they are no longer active
      if (activeField && activeField !== this) activeField.updateHasFocus(false);

      // point activeField to this field
      activeField = this; // eslint-disable-line consistent-this
    }

    const { index, name } = this.props;
    const topicVerb = hasFocus ? 'focused' : 'blurred';

    // console.log(`${name}${index} ${topicVerb}`);

    this.setState({ hasFocus });
    // publish a message for any interested parties
    this.context.pubsub.trigger(getFieldTopic(name, topicVerb), { index, name });
  }

  renderErrors () {
    const errors = this.getErrors();
    if (!errors.length) return;

    return (<div className="form__field-errors">
      {errors.map(e => (
        <div className="form__field-error" key={e}>{e}</div>
      ))}
    </div>);
  }

  renderLabel () {
    if (this.props.label) {
      return <label className="form__label" htmlFor={this.id}>{this.props.label}</label>;
    }
  }

  render () {
    // fail early for FormCollection fields without an index prop
    if ('collection' in this.context.form && typeof this.props.index !== 'number') {
      throw new Error("You've rendered a field component without an index prop as a child of a FormCollection. Please relay the index prop to each field rendered.");
    }

    const Input = this.props.component;
    const { type } = this.props;
    let classes = this.props.className.split(' ')
      .concat([
        'form__field',
        this.formatClassName('type', this.props.type),
        this.formatClassName('theme', this.props.theme),
        `${this.context.state.formName}__${this.props.name}`,
      ])
      .concat(this.getWidthClassNames());

    // add focus class
    if (this.state.hasFocus) classes.push(this.formatClassName('has', 'focus'));

    // has or no value class
    if (this.hasValue()) classes.push(this.formatClassName('has', 'value'));
    else classes.push(this.formatClassName('no', 'value'));

    // has or no errors class
    if (this.getErrors().length) classes.push(this.formatClassName('has', 'errors'));
    else classes.push(this.formatClassName('no', 'errors'));

    return (
      <div className={classes.join(' ')} onBlur={this.handleBlur} onFocus={this.handleFocus}>
        {renderIf(!FIELD_TYPES_LABEL_AFTER_INPUT.includes(type), this.renderLabel)}
        {this.renderErrors()}
        <Input {...this.getProps()} forwardedRef={this.inputRef} />
        {renderIf(FIELD_TYPES_LABEL_AFTER_INPUT.includes(type), this.renderLabel)}
        {this.props.children}
      </div>
    );
  }
}
