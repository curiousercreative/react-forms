import React from 'react';

import bindMethods from '../../util/bindMethods.js';
import callMe from '../../util/callMe.js';
import renderIf from '../../util/renderIf.js';

import FormContext from '../config/FormContext';
import isChecked from './util/isChecked';
import setValue from './util/setValue';
import toggleValue from './util/toggleValue';

/**
 * when clicked, will set a value on form, like a radio button
 * @class Button
 * @property {string} [className]
 * @property {string} [id]
 * @property {string} name
 * @property {function} [onClick]
 * @property {string} [type=radio] - what type of input to emulate (toggle vs set)
 * @property {string} value
 * @return {jsx} button.form__input
 */
export default class Button extends React.Component {
  static contextType = FormContext;
  static defaultProps = {
    className: '',
    type: 'radio',
  };

  constructor (...args) {
    super(...args);
    bindMethods(this);
  }

  handleClick (e) {
    this.setValue(this, this.props.value);

    callMe(this.props.onClick, { args: [e] });
  }

  setValue (...args) {
    switch (this.props.type) {
      case 'radio':
        return setValue(...args);
      case 'checkbox':
        return toggleValue(...args);
    }
  }

  render () {
    const isSelected = isChecked(this);
    let classes = this.props.className.split(' ').concat([
      'form__button',
      `form__button--type_${this.props.type}`,
    ]);

    if (isSelected) classes.push('form__button--is_active');

    return (<button
      id={this.props.id}
      className={classes.join(' ')}
      name={this.props.name}
      onClick={this.handleClick}
      type="button"
      value={this.props.value}>
      {this.props.children}
      {renderIf(isSelected, () => (
        <input type="hidden" name={this.props.name} value={this.props.value} />
      ))}
    </button>);
  }
}
