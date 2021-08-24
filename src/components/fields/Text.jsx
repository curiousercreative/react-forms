import React from 'react';

import bindMethods from '../../util/bindMethods.js';

// map an input type to it's inputmode attribute
const TYPE_MODE_MAP = {
  number: 'numeric',
};

/**
 * As basic as it gets, a text input
 * @class Text
 * @property {boolean} [disabled = false]
 * @property {React.Ref} [forwardedRef]
 * @property {boolean} [hasFocus]
 * @property {string} id
 * @property {string} name
 * @property {string} type - supply a type to hint device's virtual keyboard
 * @return {jsx} input.form__input
 */
export default class Text extends React.Component {
  static defaultProps = {
    disabled: false,
    type: 'text',
  };

  constructor (...args) {
    super(...args);
    bindMethods(this);
  }

  handleChange (e) {
    // handle a change to this field's value by user input
    this.props.setValue(e.target.value);
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
      ref={this.props.forwardedRef}
      placeholder={this.props.placeholder}
      type={this.getType()}
      value={this.props.getValue() || ''} />;
  }
}
