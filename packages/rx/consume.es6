import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';

export default class Consume extends Component {
  static contextTypes = {
    collection: PropTypes.func
  };
  render() {
    const { children } = this.props;
    return <Fragment>{children(this.context.collection)}</Fragment>;
  }
}

export const consume = Wrapped => props => (
  <Consume>
    {collection => <Wrapped {...props} collection={collection} />}
  </Consume>
);
