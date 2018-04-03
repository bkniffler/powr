// src/utils/AuthService.js
import { shallowEqual } from 'recompose';
import createIFrame from '../utils/iframe';
import extractCode from '../utils/extract-code';
import parseQuery from '../utils/parse-query';

export default class AuthService {
  _lastUser = null;
  mode = 'token';
  onChange = user => {
    if (this._onChange) {
      if (shallowEqual(this._lastUser, user)) {
        return;
      }
      this._lastUser = user;
      this._onChange(user);
    }
  };
  constructor(onChange, config) {
    this._onChange = onChange;
    if (!config.redirectUri) {
      config.redirectUri = `${window.location.origin}`;
    }
    if (!config.logoutUri) {
      config.logoutUri = `${window.location.origin}`;
    }
    this.config = config;
  }
  destroy = () => {
    this._onChange = null;
  };

  check = () => {
    const user = this.getStoredUser();
    if (!user) {
      return null;
    } else if (this.isExpired(user)) {
      this.refreshToken();
      return null;
    }
    return user;
  };

  logout = ({ state }) => {
    const user = this.getStoredUser();
    if (user) {
      localStorage.removeItem('auth');
    }
    const { clientID, domain, logoutUri } = this.config;
    let href = `https://${domain}/v2/logout?client_id=${clientID}&returnTo=${logoutUri}`;
    if (state) {
      href = `${href}&state=${state}`;
    }
    window.location.replace(href);
    return Promise.resolve();
  };

  login = ({
    code,
    email,
    state,
    access_token,
    expires_in,
    refresh_token
  } = {}) => {
    if (code) {
      return this.handleAuthByCode({ code });
    } else if (access_token) {
      return this.handleAuthByToken({
        access_token,
        expires_in,
        refresh_token
      });
    }
    const { clientID, audience, domain, scope, redirectUri } = this.config;
    let href = `https://${domain}/authorize?scope=${scope}&audience=${audience}&response_type=token&client_id=${clientID}&redirect_uri=${redirectUri}`;
    if (email) {
      href = `${href}&email=${email}`;
    }
    if (state) {
      href = `${href}&state=${state}`;
    }
    window.location.replace(href);
    return Promise.resolve();
  };

  refreshToken = ({ timeout = 10000, state = '/__silent' } = {}) => {
    const { clientID, audience, domain, scope, redirectUri } = this.config;
    const type = 'token';
    return createIFrame(
      `https://${domain}/authorize?scope=${scope}&audience=${audience}&response_type=${type}&client_id=${clientID}&redirect_uri=${redirectUri}/__silent_auth__&state=${state}&prompt=none`
    )
      .then(url => {
        if (type === 'code') {
          const code = extractCode(url);
          if (code) {
            this.handleAuthByCode({ code });
          }
        } else {
          const query = parseQuery(url.split('#/')[1]);
          this.handleAuthByToken(query);
        }
      })
      .catch(err => {
        console.error('Error in iFrame', err);
      });
  };

  handleAuthByCode = ({ code }, verifier) =>
    fetch(`https://${this.config.domain}/oauth/token`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        client_id: this.config.clientID,
        code_verifier: verifier,
        code,
        redirect_uri: this.config.redirectUri
      })
    })
      .then(result => result.json())
      .then(this.handleAuthByToken);

  handleAuthByToken = ({ access_token, expires_in, refresh_token }) =>
    fetch(`https://${this.config.domain}/userinfo`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        access_token
      })
    })
      .then(result => result.json())
      .then(profile => {
        const expiresAt = +new Date() + parseInt(expires_in) * 1000;
        localStorage.setItem(
          'auth',
          JSON.stringify({
            ...profile,
            accessToken: access_token,
            refreshToken: refresh_token,
            expiresAt
          })
        );
        this.onChange(profile);
        this.loaded = true;
      });

  isSet = () => {
    const user = localStorage.getItem('auth');
    if (!user) {
      return false;
    }
    return true;
  };

  isExpired = user => {
    if (!user || !user.expiresAt || !user.accessToken) {
      return true;
    }
    return +new Date() >= user.expiresAt;
  };

  getStoredUser = () => {
    const user = localStorage.getItem('auth');
    return user ? JSON.parse(user) : null;
  };
}
