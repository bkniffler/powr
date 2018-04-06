import AuthService from './web';

export default class AuthServiceElectron extends AuthService {
  login = ({ email } = {}) => {
    const {
      clientID,
      audience,
      domain,
      scope,
      redirectUri,
      options
    } = this.config;

    console.log(options);

    require.ensure(['auth0-lock'], () => {
      const Auth0Lock = require('auth0-lock').default;
      const lock = new Auth0Lock(clientID, domain, {
        language: 'de',
        configurationBaseUrl: 'https://cdn.eu.auth0.com',
        auth: {
          audience,
          redirect: false,
          // redirectUrl: redirectUri,
          params: {
            scope
          }
        },
        ...options
      });

      lock.on('authenticated', ({ accessToken, expiresIn }) => {
        lock.hide();
        this.handleAuthByToken({
          access_token: accessToken,
          expires_in: expiresIn
        });
      });
      lock.show();
    });
  };
}
