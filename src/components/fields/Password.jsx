import React from 'react';

import bindMethods from '../../util/bindMethods.js';

import FormContext from '../config/FormContext';
import getValue from './util/getValue';
import setValue from './util/setValue';

/**
 * password input that allows for toggling visibility
 * @class Password
 * @property {string} id
 * @property {string} name
 * @return {jsx} div.form-password
 */
export default class Password extends React.Component {
  static contextType = FormContext;

  state = { showPassword: false };

  constructor (...args) {
    super(...args);
    bindMethods(this);
  }

  handleChange (e) {
    setValue(this, e.target.value);
  }

  handleClick () {
    this.setState({ showPassword: !this.state.showPassword });
  }

  render () {
    const type = this.state.showPassword ? 'text' : 'password';

    return (<div className="form-password">
      <input
        id={this.props.id}
        className="form__input form__input--type_password"
        name={this.props.name}
        onChange={this.handleChange}
        ref="input"
        type={type}
        value={getValue(this) || ''} />
      <button className="btn-reset" onClick={this.handleClick} type="button" />
    </div>);
  }
}
