import isStandalone from './is-standalone';

let historyCreator = null;

if (process.env.IS_NODE) {
  historyCreator = require('history/createMemoryHistory').default;
} else if (true || process.env.IS_SERVERLESS || isStandalone) {
  historyCreator = require('history/createHashHistory').default;
} else {
  historyCreator = require('history/createBrowserHistory').default;
}

export const createHistory = (options = {}) => {
  const history = historyCreator(options);
  return history;
};
