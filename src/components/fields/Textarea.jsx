import React from 'react';

import bindMethods from '../../util/bindMethods.js';

import FormContext from '../config/FormContext';
import getValue from './util/getValue';
import setValue from './util/setValue';

/**
 * Multiline text input
 * @class Textarea
 * @property {boolean} hasFocus
 * @property {string} id
 * @property {string} name
 * @return {jsx} textarea.form__input
 */
export default class Textarea extends React.Component {
  static contextType = FormContext;

  constructor (...args) {
    super(...args);
    bindMethods(this);
  }

  handleChange (e) {
    setValue(this, e.target.value);
  }

  render () {
    return <textarea
      id={this.props.id}
      className="form__input form__input--type_textarea"
      onChange={this.handleChange}
      name={this.props.name}
      value={getValue(this) || ''} />;
  }
}
