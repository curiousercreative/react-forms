import React from 'react';
import renderer from 'react-test-renderer';

import Form from '../Form.jsx';

import bindMethods from '../../util/bindMethods.js';
import { messages, tests } from '../../lib/validator';

export default class F {
  static simpleFormJsx = <Form formName="test" initialValues={{ a: 'b' }} />;
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
