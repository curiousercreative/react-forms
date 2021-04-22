import React from 'react';

import bindMethods from '../../util/bindMethods.js';
import callMe from '../../util/callMe.js';

/**
 * when clicked, will set a value on form, like a radio button
 * @class Checkbox
 * @property {string} [className]
 * @property {object} forwardedRef
 * @property {string} id
 * @property {boolean} isChecked
 * @property {string} name
 * @property {function} [onClick]
 * @property {function} toggleValue
 * @property {any} [value = true]
 * @return {jsx} input.form__input
 */
export default class Checkbox extends React.Component {
  static defaultProps = {
    className: '',
    value: true,
  };

  constructor (...args) {
    super(...args);
    bindMethods(this);
  }

  handleClick (e) {
    this.props.toggleValue(this.props.value);

    callMe(this.props.onClick, { args: [e] });
  }

  render () {
    let classes = this.props.className.split(' ').concat('form__checkbox');
    const checked = this.props.isChecked;

    if (checked) classes.push('form__checkbox--is_active');

    return <input
      defaultChecked={checked}
      className={classes.join(' ')}
      id={this.props.id}
      name={this.props.name}
      onClick={this.handleClick}
      ref={this.props.forwardedRef}
      type="checkbox"
      value={this.props.value} />;
  }
}
