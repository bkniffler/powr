import React from 'react';
import Context from './context';

export default Context.Consumer;
export const withConsumer = Wrapped => props => (
  <Context.Consumer>
    {auth => <Wrapped auth={auth} {...props} />}
  </Context.Consumer>
);
