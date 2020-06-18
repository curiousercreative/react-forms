import React from 'react';

import { Pubsub } from '../../lib/pubsub';

import F from './TestHelper';

describe('Form instance pubsub', () => {
  test('Form instance should have pubsub property', () => {
    expect(F.render().pubsub).toBeInstanceOf(Pubsub);
  });

  test('Form instance pubsubs should be discrete channels', () => {
    let eventTriggered = false;
    const form1 = F.render();
    const form2 = F.render();

    form1.pubsub.on('event', () => {
      eventTriggered = true;
    });
    form2.pubsub.trigger('event');

    expect(eventTriggered).toBe(false);
  });

  test('Form instance pubsub should emit when form value updates', () => {
    let fieldUpdated = null;
    const form = F.render();

    form.pubsub.on('field.updated', update => {
      [ fieldUpdated ] = update;
    });

    return form.setValue('name', 'value')
      .then(() => {
        setTimeout(() => expect(fieldUpdated).toBe('name'), 0);
      });
  });
});
