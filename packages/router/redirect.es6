import React from 'react';
import PropTypes from 'prop-types';
import { withPush, withReplace, withPathname } from './decorators';
import { withLocation } from './link';

@withLocation
class Redirect extends React.Component {
  static propTypes = {
    from: PropTypes.string,
    to: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    pathname: PropTypes.string
  };

  componentWillMount() {
    if (typeof window === 'undefined') {
      this.perform();
    }
  }

  componentDidMount() {
    if (typeof window !== 'undefined') {
      this.perform();
    }
  }

  perform() {
    const { replace, location, from, pathname } = this.props;

    if (from && from !== pathname) {
      return;
    }
    console.log('REPLACE');
    replace(location);
  }

  render() {
    const { children } = this.props;
    return children || null;
  }
}

export default withPathname(withReplace(Redirect));
