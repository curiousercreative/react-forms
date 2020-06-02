import React from 'react';
import { FormContext, util } from 'form';
import { getValue, setValue } from  'form/dist/components/fields/util';

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
