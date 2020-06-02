import React from 'react';

import bindMethods from '../../util/bindMethods.js';
import callMe from '../../util/callMe.js';

import FormContext from '../config/FormContext';
import isChecked from './util/isChecked';
import toggleValue from './util/toggleValue';

/**
 * when clicked, will set a value on form, like a radio button
 * @class Checkbox
 * @property {string} [className]
 * @property {string} id
 * @property {string} name
 * @property {function} [onClick]
 * @property {string} value
 * @return {jsx} input.form__input
 */
export default class Checkbox extends React.Component {
  static contextType = FormContext;
  static defaultProps = {
    className: '',
    type: 'checkbox',
  };

  constructor (...args) {
    super(...args);
    bindMethods(this);
  }

  handleClick (e) {
    toggleValue(this, this.props.value);

    callMe(this.props.onClick, { args: [e] });
  }

  render () {
    let classes = this.props.className.split(' ').concat('form__button');
    const checked = isChecked(this);

    if (checked) classes.push('form__button--is_active');

    return <input
      defaultChecked={checked}
      className={classes.join(' ')}
      id={this.props.id}
      name={this.props.name}
      onClick={this.handleClick}
      type="checkbox"
      value={this.props.value} />;
  }
}
