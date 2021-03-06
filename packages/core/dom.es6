import React from 'react';
import App, { plugins } from '__resourceQuery';
import { render, hydrate } from 'react-dom';

import inject from './inject';

const { decorate, bootstrap } = inject(plugins);
const container = document.getElementById('app');

const renderApp = async Component => {
  const app = <Component ua={window.navigator.userAgent} />;
  const method = window.INITIAL_DATA ? hydrate : render;
  await bootstrap();
  method(app, container);
};

if (window.cordova) {
  document.addEventListener(
    'deviceready',
    () => renderApp(decorate(App)),
    false
  );
} else {
  renderApp(decorate(App));
}

if (module.hot && typeof module.hot.accept === 'function') {
  module.hot.accept('__resourceQuery', () => {
    const NextRoot = require('__resourceQuery').default;
    renderApp(decorate(NextRoot));
  });
}
