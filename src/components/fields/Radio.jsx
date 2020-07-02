import React from 'react';

import bindMethods from '../../util/bindMethods.js';
import callMe from '../../util/callMe.js';

/**
 * when clicked, will set a value on form, like a radio button
 * @class Radio
 * @property {string} [className]
 * @property {string} id
 * @property {string} name
 * @property {function} [onClick]
 * @property {string} [type=radio] - what type of input to emulate (toggle vs set)
 * @property {string} value
 * @return {jsx} input.form__input
 */
export default class Radio extends React.Component {
  static defaultProps = {
    className: '',
    type: 'radio',
  };

  constructor (...args) {
    super(...args);
    bindMethods(this);
  }

  handleClick (e) {
    this.props.setValue(this.props.value);

    callMe(this.props.onClick, { args: [e] });
  }

  render () {
    let classes = this.props.className.split(' ').concat('form__radio');
    const checked = this.props.isChecked();

    if (checked) classes.push('form__radio--is_active');

    return <input
      defaultChecked={checked}
      className={classes.join(' ')}
      id={this.props.id}
      name={this.props.name}
      onClick={this.handleClick}
      ref={this.props.forwardedRef}
      type="radio"
      value={this.props.value} />;
  }
}
