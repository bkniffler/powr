const web = require('@alpacka/plugin-web');
const less = require('@alpacka/plugin-less');
const babel = require('@alpacka/plugin-babel-react');
const env = require('@alpacka/plugin-env');

module.exports = (src, args) => (config, props) => {
  const { statics = [], offline, primaryColor, mode, history } = args;
  const { chain, target } = props;
  config.entry.push('@powr/dom');
  config.resolve.alias.__resourceQuery = src;
  config.resolve.modules.push(src);

  if (target === 'electron-renderer') {
    config.resolve.alias.superagent = 'superagent/superagent';
    config.resolve.alias['cross-fetch/polyfill'] =
      'cross-fetch/dist/browser-polyfill';
  }

  return chain(config, [
    less({
      modifyVars: {
        'menu-collapsed-width': '64px',
        'font-family-no-number':
          '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
        'font-family':
          '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
        'font-size-base': '15px',
        'primary-color': primaryColor || '#8e44ad'
      }
    }),
    babel({
      include: src
    }),
    web({
      template: '@powr/template',
      statics,
      offline
    }),
    env({
      'process.env.ROUTING': `"${history}"`,
      'process.env.SERVER_MODE': `"${mode}"`,
      'process.env.IS_SERVERLESS': `${mode === 'serverless'}`,
      'process.env.IS_SSR': `${mode === 'ssr'}`,
      'process.env.IS_STATIC': `${mode === 'static'}`
    })
  ]);
};

module.exports.HISTORY_MEMORY = 'MEMORY';
module.exports.HISTORY_BROWSER = 'BROWSER';
module.exports.HISTORY_HASH = 'HASH';
