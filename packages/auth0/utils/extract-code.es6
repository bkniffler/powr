import parseQuery from './parse-query';
export default url =>
  (parseQuery(url.substr(url.indexOf('?'))) || {}).code.split('#')[0];
