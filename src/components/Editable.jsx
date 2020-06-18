import React from 'react';

import always from '../util/always';
import bindMethods from '../util/bindMethods';

import FormContext from './config/FormContext';

// NOTE: IN DEVELOPMENT, NOT READY FOR USE IN PRODUCTION

/**
 * @property {function} [discard] - discards temporary data
 * @property {React.Component} displayComponent - component to render for display view
 * @property {React.Component} editableComponent - component to render for editing view
 * @property {number} [index] - index in collection (when part of a FormCollection)
 * @property {function} [remove] - removes entire item, including persistent data
 * @property {function} [save] - saves entire item, moving temporary data to persistent
 * @example <Editable displayComponent={ProductDisplay} editableComponent={ProductEditable} index={1} />
 */
export default class Editable extends React.Component {
  static contextType = FormContext;

  state = {
    isEditing: true,
    isLoading: false,
  }

  constructor (...args) {
    super(...args);
    bindMethods(this);
  }

  handleClickCancel () {
    this.stopEditing();
  }

  handleClickDiscard () {
    return this.props.discard
      ? this.props.discard()
      : this.context.form.resetTemporaryItem(this.getData());
  }

  handleClickEdit () {
    this.startEditing();
  }

  handleClickRemove () {
    if (this.state.isLoading) return;
    this.setState({ isLoading: true });

    this.props.remove()
      .catch(() => this.setState({ isLoading: false }));
  }

  handleClickSave () {
    if (this.state.isLoading) return;
    this.setState({ isLoading: true });

    this.props.save()
      .then(...always(() => this.setState({ isLoading: false })))
      .then(this.stopEditing);
  }

  getData () {
    const data = this.context.form.getData();

    // handle differences between Form and FormCollection ancestors
    return isNaN(this.props.index) ? data : data[this.props.index];
  }

  isEditing () {
    return this.state.isEditing;
  }

  startEditing () {
    this.setState({ isEditing: true });

    // // publish a dumb message in case someone cares that we started editing
    // let topicPieces = ['editable', 'startEditing'];
    // if (this.context) topicPieces.push(this.context.formName);
    // pubsub.trigger(topicPieces.join('.'), this.props.index);
  }

  stopEditing () {
    this.setState({ isEditing: false });

    // // publish a dumb message in case someone cares that we stopped editing
    // let topicPieces = ['editable', 'stopEditing'];
    // if (this.context) topicPieces.push(this.context.formName);
    // pubsub.trigger(topicPieces.join('.'), this.props.index);
  }

  render () {
    // determine which view to render
    const Component = this.isEditing() ? this.props.editableComponent : this.props.displayComponent;
    // we always have these handlers
    let handlers = {
      onClickCancel: this.handleClickCancel,
      onClickEdit: this.handleClickEdit,
    };

    // only provide these to view components if they're available
    if (this.props.discard) handlers.onClickDiscard = this.handleClickDiscard;
    if (this.props.remove) handlers.onClickRemove = this.handleClickRemove;
    if (this.props.save) handlers.onClickSave = this.handleClickSave;

    return <Component {...handlers} data={this.getData()} index={this.props.index} isLoading={this.state.isLoading} />;
  }
}
