import React from 'react';
import ThemeContext from './context';

export default Wrapped => props => (
  <ThemeContext.Consumer>
    {val => <Wrapped {...props} user={val} />}
  </ThemeContext.Consumer>
);
