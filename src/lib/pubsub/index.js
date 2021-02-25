import PubSub from 'pubsub-js';
import timeoutPromise from '../../util/timeoutPromise.js';

let i = 1;

/**
 * a simple wrapper around a popular publish/subscribe npm package https://github.com/mroderick/PubSubJS
 * we've aliased it's methods with shorter names and added channel isolation
 * @module
 * @example
 * import pubsub from 'lib/pubsub';
 *
 * // add a listener
 * pubsub.on('user.loggedIn', () => alert('you logged in!')
 *
 * // nothing will happen until we trigger 'user.loggedIn' like below.
 * pubsub.trigger('user.loggedIn')
 *
 * // when we're done and don't want to listen to 'user.loggedIn' anymore
 * pubsub.off('user.loggedIn');
 */

/**
 * @class Pubsub
 * @property {string} id - allows for discrete/scoped Pubsub broadcasts
 */
export class Pubsub {
  // the underlying PubSub object is a singleton, so we use this unique string as
  // a namespace to achieve discrete channeling
  id = `scope${i++}`;
  // because we're arg juggling in Pubsub.on, we keep references to both juggled
  // and pre-juggled functions in this object
  listeners = {};

  /**
   * parseTopic
   * @param  {string} topic
   * @return {string} with id prepended for scoping
   */
  parseTopic (topic) {
    let namespaces = [this.id];

    if (topic) namespaces.push(topic);

    return namespaces.join('.');
  }

  /**
   * on
   * @param  {string}   topic
   * @param  {Function} callback
   * @return {string}  token for unsubscribing
   */
  on (topic, callback) {
    // console.log('pubsub listening', topic, callback)
    // juggle the args, but keep a reference to both juggled and prejuggled functions
    // for use in .off
    this.listeners[callback] = (topic, data) => callback(data, topic);

    // reverse the order of the callback params so that data is first
    return PubSub.subscribe(this.parseTopic(topic), this.listeners[callback]);
  }

  /**
   * once - subscription that is triggered at most once
   * @param  {string}   topic
   * @param  {Function} callback
   * @return {string}  token for unsubscribing
   * @credit https://github.com/mroderick/PubSubJS/blob/master/src/pubsub.js#L198
   */
  once (topic, callback) {
    const token = this.on(topic, () => {
      this.off(token);
      callback.apply(this, arguments);
    });

    return token;
  }

  /**
   * off
   * @param  {string|function} topic - most commonly, this is a topic string.
   * less commonly, this can be a listener function and we'll unsubscribe any listeners that use function as callback
   * Less common still it's a token returned by Pubsub.on
   */
  off (topic) {
    if (typeof topic === 'string' && !(/^uid_[0-9]+$/).test(topic)) {
      topic = this.parseTopic(topic);
    }
    else if (typeof topic === 'function') {
      topic = this.listeners[topic];
      delete this.listeners[topic];
    }

    PubSub.unsubscribe(topic);
  }

  /**
   * trigger
   * @param  {string} topic
   * @param  {any} data
   * @return {Promise} resolves with {boolean} whether publish was successful
   */
  trigger (topic, data) {
    // console.log('pubsub event', topic, data);
    const success = PubSub.publish(this.parseTopic(topic), data);

    return timeoutPromise(0)
      .then(() => success);
  }
}

export const pubsub = new Pubsub();
export default pubsub;
