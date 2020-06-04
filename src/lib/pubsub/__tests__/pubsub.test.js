import { Pubsub, default as pubsub } from '../index.js';

afterEach(() => {
  window.PubSub.clearAllSubscriptions();
});

// NOTE: we need to wait after every Pubsub.trigger since it's async
describe('pubsub tests', () => {
  // NOTE: not sure how to test this...
  // test('pubsub default export should be singleton', () => {
  //
  // });

  test('pubsub default export should be instance of Pubsub', () => {
    expect(pubsub).toBeInstanceOf(Pubsub);
  });

  test('Pubsub instance should allow for a simple subscription and publish', () => {
    const instance = new Pubsub();
    const mock = jest.fn();
    instance.on('a', mock);

    return instance.trigger('a')
      .then(() => expect(mock.mock.calls.length).toBe(1));
  });

  test('Pubsub.on should receive data from trigger', () => {
    let receivedData;
    const instance = new Pubsub();
    function mock (data) {
      receivedData = data;
    }
    const expectedData = { key1: 'blah', key2: 'la la' };
    instance.on('a', mock);

    return instance.trigger('a', expectedData)
      .then(() => expect(receivedData).toEqual(expectedData));
  });

  test('Pubsub.on should return a token for unsubscribing', () => {
    const instance = new Pubsub();
    const mock = jest.fn();

    expect(typeof instance.on('a', mock)).toEqual('string');
  });

  test('Pubsub.trigger should return a promise resolving with true when a subscriber is set', () => {
    const instance = new Pubsub();
    const mock = jest.fn();
    instance.on('a', mock);

    return expect(instance.trigger('a')).resolves.toBe(true);
  });

  test('Pubsub.trigger should return a promise resolving with false when no subscriber is set', () => {
    const instance = new Pubsub();

    return expect(instance.trigger('a')).resolves.toBe(false);
  });

  // https://github.com/mroderick/PubSubJS#hierarchical-addressing
  test('Pubsub.trigger should publish a message to every subscriber with matching topic or within namespace', () => {
    const instance = new Pubsub();
    const mock = jest.fn();
    instance.on('someModule', mock); // should be called
    instance.on('someModule.someEvent', mock); // should be called
    instance.on('someModule.someEvent1', mock);
    instance.on('someModul', mock);

    return instance.trigger('someModule.someEvent')
      .then(() => expect(mock.mock.calls.length).toBe(2));
  });

  test('Pubsub.off should remove subscriptions given a topic', () => {
    const instance = new Pubsub();
    const mock = jest.fn();

    return Promise.resolve()
      .then(() => instance.on('a', mock))
      .then(() => instance.trigger('a'))
      .then(() => instance.off('a'))
      .then(() => instance.trigger('a'))
      .then(() => expect(mock.mock.calls.length).toBe(1));
  });

  test('Pubsub.off should remove subscriptions given a function', () => {
    const instance = new Pubsub();
    const mock = jest.fn();

    return Promise.resolve()
      .then(() => instance.on('a', mock))
      .then(() => instance.trigger('a'))
      .then(() => new Promise(resolve => setTimeout(resolve, 0)))
      .then(() => instance.off(mock))
      .then(() => instance.trigger('a'))
      .then(() => new Promise(resolve => setTimeout(resolve, 0)))
      .then(() => expect(mock.mock.calls.length).toBe(1));
  });

  test('Pubsub.off should remove subscriptions given a token', () => {
    const instance = new Pubsub();
    const mock = jest.fn();
    const token = instance.on('a', mock);

    return instance.trigger('a')
      .then(() => instance.off(token))
      .then(() => instance.trigger('a'))
      .then(() => expect(mock.mock.calls.length).toBe(1));
  });

  test('pubsub trigger should not trigger newly created Pubsub listener for the same topic', () => {
    const instance = new Pubsub();
    const mock = jest.fn();

    return Promise.resolve()
      .then(() => instance.on('a', mock))
      .then(() => pubsub.trigger('a', 'b'))
      .then(() => expect(mock).not.toBeCalled());
  });

  test('Pubsub.once should listen for only a single publish', () => {
    const instance = new Pubsub();
    const mock = jest.fn();
    instance.once('a', mock);

    return instance.trigger('a')
      .then(() => instance.trigger('a'))
      .then(() => expect(mock.mock.calls.length).toBe(1));
  });

  test('Pubsub.once should return token for unsubscribing and not listen to publishes', () => {
    const instance = new Pubsub();
    const mock = jest.fn();
    instance.off(instance.once('a', mock));

    return instance.trigger('a')
      .then(() => expect(mock.mock.calls.length).toBe(0));
  });
});
