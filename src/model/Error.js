import isJsx from '../util/isJsx.js';

const MESSAGE_ALIASES = [ 'message', 'msg', 'error' ];
const META_ALIASES = [ 'meta' ];
const NAME_ALIASES = [ 'name', 'field', 'param' ];

export default class Error {
  /**
   * @param  {object | string[] | Error | string | jsx} error
   * @return {object} { message: String? | jsx?; meta: String?; name: String?; }
   */
  static normalize (error) {
    let message;
    let meta;
    let name;
    let type;

    switch (typeof error) {
      case 'object':
        if (Array.isArray(error)) type = 'entries';
        else if (isJsx(error)) type = 'jsx';
        else if (error instanceof Error) type = 'error';
        else type = 'object';
        break;
      case 'string':
        type = 'string';
        break;
      default:
        console.error(new Error(`Found error of unknown type: ${error}`));
    }

    switch (type) {
      case 'object':
      case 'error':
        message = aliasValue(error, MESSAGE_ALIASES);
        meta = aliasValue(error, META_ALIASES);
        name = aliasValue(error, NAME_ALIASES);
        break;

      case 'entries':
        name = error[0];
        message = error[1];
        meta = error[2];
        break;

      case 'jsx':
      case 'string':
        message = error;
    }

    return { message, meta, name };
  }

  /**
   * @param  {object[]} errors
   * @return {object[]}
   */
  static errorsWithoutWarnings (errors) {
    return errors.filter(e => !e.meta || !e.meta.warning);
  }
}

/**
 * @param  {object} obj
 * @param  {string[]} aliases
 * @return {any}
 */
function aliasValue (obj, aliases) {
  for (let i = 0; i < aliases.length; i++) {
    const key = aliases[i];

    if (key in obj) return obj[key];
  }
}
