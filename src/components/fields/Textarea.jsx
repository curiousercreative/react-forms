import React from 'react';

import bindMethods from '../../util/bindMethods.js';

/**
 * Multiline text input
 * @class Textarea
 * @property {boolean} hasFocus
 * @property {string} id
 * @property {string} name
 * @return {jsx} textarea.form__input
 */
export default class Textarea extends React.Component {
  constructor (...args) {
    super(...args);
    bindMethods(this);
  }

  handleChange (e) {
    this.props.setValue(e.target.value);
  }

  render () {
    return <textarea
      id={this.props.id}
      className="form__input form__input--type_textarea"
      onChange={this.handleChange}
      name={this.props.name}
      ref={this.props.forwardedRef}
      value={this.props.getValue() || ''} />;
  }
}
