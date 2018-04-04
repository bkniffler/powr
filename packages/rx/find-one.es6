import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';

export default class Get extends Component {
  static contextTypes = {
    collection: PropTypes.func
  };
  state = {};
  async componentDidMount(props = this.props) {
    const collection = await Promise.resolve(
      this.context.collection(props.type)
    );
    if (!collection) {
      return;
    }
    collection
      .findOne()
      .where('_id')
      .eq(props.id)
      .exec()
      .then(data => {
        this.setState({ data, collection });
      });
  }
  componentWillReceiveProps(newProps) {
    if (this.props.id !== newProps.id) {
      this.componentDidMount(newProps);
    }
  }
  render() {
    const { children } = this.props;
    return (
      <Fragment>{children(this.state.data, this.state.collection)}</Fragment>
    );
  }
}
