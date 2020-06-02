// bind all methods except whose that match this regex (react lifecycle methods)
const REGEX = /^(component.*|render)$/;

/**
 * bind the `this` keyword in event handling class methods.
 * This is a side effects function, mutates instance parameter
 * @function bindMethodsTo
 * @param  {object} instance - object whose methods to look over and bind to itself
 */
export default function bindMethods (instance) {
  // look over all properties and methods of this object
  getPropertyNames(instance)
    // filter to only methods (eliminate properties)
    .filter(methodName => typeof instance[methodName] === 'function')
    // filter to only look at methods that don't match of regex
    .filter(methodName => !methodName.match(REGEX))
    // bind these methods to the class instance
    .forEach(methodName => {
      instance[methodName] = instance[methodName].bind(instance);
    });
}

function getPropertyNames (instance) {
  let propertyNames = [];

  // starting with this instance and crawling our way up the prototype chain...
  // add all property names to an array until we hit the React.Component class
  for (let proto = instance; !proto.hasOwnProperty('isReactComponent'); proto = Object.getPrototypeOf(proto)) {
    propertyNames = propertyNames.concat(Object.getOwnPropertyNames(proto));
  }

  return propertyNames;
}
