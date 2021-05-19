export default class Option {
  static getOptionsWithIndexes (options) {
    return options.map((opt, i) => ({ ...opt, i }));
  }

  static getSelectedIndexes (options, values) {
    values = Array.isArray(values) ? values : [ values ];

    return values
      .map(v => options.findIndex(o => o.value === v))
      .filter(i => i > -1);
  }

  static getValueFromNativeEvent (options, e) {
    return options[Number(e.currentTarget.value)].value;
  }
}
