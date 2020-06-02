import React from 'react';
import { findDOMNode } from 'react-dom';

import bindMethods from '../../util/bindMethods.js';
import exists from '../../util/exists.js';

import FormContext from '../config/FormContext';
import getFieldTopic from './util/getFieldTopic';
import getValue from './util/getValue';
import setValue from './util/setValue';

// map an input type to it's inputmode attribute
const TYPE_MODE_MAP = {
  number: 'numeric',
};

/**
 * As basic as it gets, a text input
 * @class Text
 * @property {string} id
 * @property {string} name
 * @property {string} type - supply a type to hint device's virtual keyboard
 * @return {jsx} input.form__input
 */
export default class Text extends React.Component {
  static contextType = FormContext;
  static defaultProps = {
    type: 'text',
  };

  constructor (...args) {
    super(...args);
    bindMethods(this);
  }

  componentDidMount () {
    const topic = getFieldTopic(this.props.name);

    this.onChange();

    this.context.state.form.pubsub.on(topic, this.onChange);
  }

  componentWillUnmount () {
    const topic = getFieldTopic(this.props.name);

    this.context.state.form.pubsub.off(topic);
  }

  handleChange (e) {
    // handle a change to this field's value by user input
    setValue(this, e.target.value);
  }

  onChange (value) {
    value = value || getValue(this);

    if (!exists(value)) return;

    // handle a change to this field's value from above
    findDOMNode(this.refs.input).value = value;
  }

  getInputMode () {
    const { type } = this.props;

    switch (type) {
      case 'email':
      case 'number':
      case 'search':
      case 'tel':
      case 'url':
        return TYPE_MODE_MAP[type] || type;
    }
  }

  getType () {
    const BLACKLIST = ['url'];

    // because these input types bring browser default validation that is difficult
    // to customize/disable/override, we will to override the type to text
    return BLACKLIST.includes(this.props.type.toLowerCase())
      ? 'text'
      : this.props.type;
  }

  render () {
    return <input
      id={this.props.id}
      className="form__input form__input--type_text"
      disabled={this.props.disabled}
      inputMode={this.getInputMode()}
      name={this.props.name}
      onChange={this.handleChange}
      ref="input"
      placeholder={this.props.placeholder}
      type={this.getType()} />;
  }
}
