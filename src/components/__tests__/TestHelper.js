import React from 'react';
import renderer from 'react-test-renderer';

import Form from 'components/form/Form';

import bindMethods from 'util/bindMethods';
import { messages, tests } from 'lib/validator';

export default class F {
  static simpleFormJsx = <Form formName="test" values={{ a: 'b' }} />;
  static extendForm (attributesAndMethods = {}) {
    return class extends Form {
      constructor (...args) {
        super(...args);
        Object.entries(attributesAndMethods).forEach(([ key, val ]) => {
          this[key] = val;
        });
        bindMethods(this);
      }
    };
  }

  static render (jsx = F.simpleFormJsx) {
    return renderer.create(jsx).getInstance();
  }

  static getValidations (names = [ 'a' ]) {
    return [{ names, tests: [[ tests.required, messages.required ]] }];
  }
}
