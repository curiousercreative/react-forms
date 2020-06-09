import React from 'react';
import { FormContext, util } from '@curiouser/react-forms';
import { getValue, setValue } from '@curiouser/react-forms/dist/components/fields/util';

export default class NativeSelect extends React.Component {
  static contextType = FormContext;

  constructor (...args) {
    super(...args);
    util.bindMethods(this);
  }

  handleChange (e) {
    setValue(this, e.target.value);
  }

  render () {
    return (
      <select onChange={this.handleChange} value={getValue(this)}>
        {this.props.options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    );
  }
}
