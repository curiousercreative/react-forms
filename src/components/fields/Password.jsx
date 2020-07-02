import React from 'react';

import bindMethods from '../../util/bindMethods.js';

/**
 * password input that allows for toggling visibility
 * @class Password
 * @property {string} id
 * @property {string} name
 * @return {jsx} div.form-password
 */
export default class Password extends React.Component {
  state = { showPassword: false };

  constructor (...args) {
    super(...args);
    bindMethods(this);
  }

  handleChange (e) {
    this.props.setValue(e.target.value);
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
        ref={this.props.forwardedRef}
        type={type}
        value={this.props.getValue() || ''} />
      <button className="form__btn-reset" onClick={this.handleClick} type="button">{this.state.showPassword ? 'hide' : 'show'}</button>
    </div>);
  }
}
