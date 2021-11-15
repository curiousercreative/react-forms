import React from 'react';

import bindMethods from '../../util/bindMethods.js';

/**
 * password input that allows for toggling visibility
 * @class Password
 * @property {string} [autoComplete]
 * @property {boolean} [disabled = false]
 * @property {string} id
 * @property {string} name
 * @property {string} [placeholder]
 * @property {any} [readOnly]
 * @return {jsx} div.form-password
 */
export default class Password extends React.Component {
  static defaultProps = {
    disabled: false,
  };
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
        autoComplete={this.props.autoComplete}
        className="form__input form__input--type_password"
        disabled={this.props.disabled}
        name={this.props.name}
        onChange={this.handleChange}
        placeholder={this.props.placeholder}
        readOnly={this.props.readOnly}
        ref={this.props.forwardedRef}
        type={type}
        value={this.props.getValue() || ''} />
      <button className="form__btn-reset" onClick={this.handleClick} type="button">{this.state.showPassword ? 'hide' : 'show'}</button>
    </div>);
  }
}
