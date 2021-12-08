// blacklist for type HTML attribute
const TYPE_BLACKLIST = [ 'url' ];

// map an input type to it's inputmode attribute
const TYPE_MODE_MAP = {
  number: 'numeric',
};

export default class Input {
  static getInputMode (type = 'text') {
    switch (type) {
      case 'email':
      case 'number':
      case 'search':
      case 'tel':
      case 'url':
        return TYPE_MODE_MAP[type] || type;
    }
  }

  static getType (type = 'text') {
    // because these input types bring browser default validation that is difficult
    // to customize/disable/override, we will to override the type to text
    return TYPE_BLACKLIST.includes(type.toLowerCase()) ? 'text' : type;
  }
}
