import React, { Component } from 'react';
import { withQueryParam, withRouting, withPathname } from '@powr/router';
import parseQuery from './utils/parse-query';
import Context from './context';

let Auth0;
if (process.env.IS_ELECTRON) {
  Auth0 = require('./env/electron').default; // eslint-disable-line
} else {
  Auth0 = require('./env/web').default; // eslint-disable-line
}

@withPathname
@withQueryParam('code')
@withRouting
export default class AuthProvider extends Component {
  constructor(props) {
    super(props);

    const { env: Service = Auth0, ...rest } = props;
    this.service = new Service(this.onChange, {
      redirectUri: process.env.AUTH0_REDIRECT_URI,
      domain: process.env.AUTH0_DOMAIN,
      clientID: process.env.AUTH0_CLIENT_ID,
      audience: process.env.AUTH0_AUDIENCE,
      scope: process.env.AUTH0_SCOPE || 'openid email profile',
      ...rest
    });
    const user = this.service.getStoredUser();
    this.state = {
      login: this.login,
      logout: this.logout,
      loading: true,
      user
    };
  }
  componentDidMount() {
    const { code, pushPathname, pathname } = this.props;

    if (pathname.indexOf('/access_token=') === 0) {
      // extract hash routing
      const query = parseQuery(pathname.substr(1));
      if (query.state && query.state.indexOf('__silent') !== -1) {
        return;
      }
      this.login(query);
      pushPathname('/');
    } else if (pathname === '/login' || code) {
      pushPathname('/');
      this.login({ code });
    } else if (pathname === '/logout') {
      pushPathname('/');
    } else {
      this.service.check();
    }
  }
  onChange = user => {
    this.setState({
      user,
      accessToken: localStorage.getItem('access_token')
    });
  };
  login = (...args) => this.service.login(...args);
  logout = (...args) => this.service.logout(...args);
  render() {
    const { children } = this.props;
    return (
      <Context.Provider value={this.state}>
        {children(this.state)}
      </Context.Provider>
    );
  }
}
