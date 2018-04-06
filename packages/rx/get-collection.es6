import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';

export default class GetCollection extends Component {
  static contextTypes = {
    collection: PropTypes.func
  };
  state = {};
  async componentDidMount(props = this.props) {
    const collection = await Promise.resolve(
      this.context.collection(props.type)
    );
    this.setState({ collection });
  }
  componentWillReceiveProps(newProps) {
    if (this.props.type !== newProps.type) {
      this.componentDidMount(newProps);
    }
  }
  render() {
    const { children } = this.props;
    return <Fragment>{children(this.state.collection)}</Fragment>;
  }
}

export const getCollection = (type, as = 'collection') => Wrapped => props => (
  <GetCollection type={type}>
    {collection => <Wrapped {...props} {...{ [as]: collection }} />}
  </GetCollection>
);
