// src/utils/AuthService.js
import { shallowEqual } from 'recompose';
import createIFrame from '../utils/iframe';
import extractCode from '../utils/extract-code';
import parseQuery from '../utils/parse-query';

const isInWebAppiOS = window.navigator.standalone == true;
const isInWebAppChrome = window.matchMedia('(display-mode: standalone)')
  .matches;
const isWebApp = true || isInWebAppiOS || isInWebAppChrome;
export default class AuthService {
  _lastUser = undefined;
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
  constructor(onChange, config, loader) {
    this._onChange = onChange;
    if (!config.redirectUri) {
      config.redirectUri = `${window.location.origin}`;
    }
    if (!config.logoutUri) {
      config.logoutUri = `${window.location.origin}`;
    }
    this.config = config;
    this.loader = loader;
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
    const { clientID, domain, logoutUri } = this.config;
    let href = `https://${domain}/v2/logout?client_id=${clientID}&returnTo=${logoutUri}`;
    if (state) {
      href = `${href}&state=${state}`;
    }
    this.loader.start('logout');
    return createIFrame(href)
      .then(url => {
        const user = this.getStoredUser();
        if (user) {
          localStorage.removeItem('auth');
        }
        this.onChange(null);
        this.loader.stop();
      })
      .catch(err => {
        console.error('Error in iFrame', err);
        this.loader.stop();
      });

    /*
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
    return Promise.resolve(); */
  };

  login = (args = {}) => {
    const { code, email, state } = args;
    if (code) {
      return this.handleAuthByCode(args);
    } else if (args.access_token) {
      return this.handleAuthByToken(args);
    }
    const { clientID, audience, domain, scope, redirectUri } = this.config;
    let href = `https://${domain}/authorize?scope=${scope}&audience=${audience}&response_type=token&client_id=${clientID}&redirect_uri=${redirectUri}`;
    if (email) {
      href = `${href}&email=${email}`;
    }
    if (isWebApp) {
      // href = `${href}&state=__silent`;
      return createIFrame(encodeURI(href), true)
        .then(url => {
          const query = parseQuery(new URL(url).hash.substr(2));
          if (!query.access_token) {
            return;
          }
          return this.handleAuthByToken(query);
        })
        .catch(err => {
          console.error(err);
        });
      const win = window.open(href, '_system');
      window.addEventListener('message', e => {
        console.log(e);
        win.close();
      });
      /* const timer = setInterval(() => {
        if (win.closed) {
          clearInterval(timer);
          const query = parseQuery(new URL(win.location.href).hash.substr(2));
          if (!query.access_token) {
            return;
          }
          return this.handleAuthByToken(query);
        }
      }, 250); */
      return Promise.resolve();
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
    this.loader.start('refresh');
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
        this.loader.stop();
      })
      .catch(err => {
        console.error('Error in iFrame', err);
        this.loader.stop();
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
        const user = {
          ...profile,
          accessToken: access_token,
          refreshToken: refresh_token,
          expiresAt
        };
        localStorage.setItem('auth', JSON.stringify(user));
        this.onChange(user);
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
