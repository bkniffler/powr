<div align="center">
  <a href="https://github.com/bkniffler/powr">
    <img alt="powr" src="https://raw.githubusercontent.com/bkniffler/powr/master/assets/logo.png" height="250px" />
  </a>
</div>

<div align="center">
  <h2>powr</h2>
  <strong>A react application framework for web, electron and SSR, driven by plugins</strong>
  <br />
  <br />
  <a href="https://travis-ci.org/bkniffler/powr">
    <img src="https://img.shields.io/travis/bkniffler/powr.svg?style=flat-square" alt="Build Status">
  </a>
  <a href="https://codecov.io/github/bkniffler/powr">
    <img src="https://img.shields.io/codecov/c/github/bkniffler/powr.svg?style=flat-square" alt="Coverage Status">
  </a>
  <a href="https://www.npmjs.com/package/@powr/core">
    <img src="https://img.shields.io/npm/dm/@powr/core.svg?style=flat-square" alt="Downloads">
  </a>
  <a href="https://github.com/bkniffler/powr">
    <img src="https://img.shields.io/github/issues/bkniffler/powr.svg?style=flat-square" alt="Issues">
  </a>
  <a href="https://github.com/bkniffler/powr">
    <img src="https://img.shields.io/github/package-json/v/bkniffler/powr.svg?style=flat-square" alt="Version">
  </a>
  <a href="https://github.com/bkniffler/powr">
    <img src="https://img.shields.io/github/forks/bkniffler/powr.svg?style=flat-square" alt="Forks">
  </a>
  <a href="https://github.com/bkniffler/powr">
    <img src="https://img.shields.io/github/stars/bkniffler/powr.svg?style=flat-square" alt="Stars">
  </a>
  <a href="https://github.com/bkniffler/powr/master/LICENSE">
    <img src="https://img.shields.io/github/license/bkniffler/powr.svg?style=flat-square" alt="License">
  </a>
  <br />
  <br />
</div>

A react application framework driven by plugins.

## Kickstart

```bash
npm i @powr/app
# More
npm i @powr/mongodb @powr/auth0 @powr/type-date @powr/type-json
```

```jsx
import api from '@powr/api';

...
```

## Plugins

### Core

* [@powr/redux](https://github.com/bkniffler/powr/tree/master/packages/redux): Redux
* [@powr/async](https://github.com/bkniffler/powr/tree/master/packages/async): Async components for lazy chunk loading
* [@powr/router](https://github.com/bkniffler/powr/tree/master/packages/router): Router
* [@powr/crypt](https://github.com/bkniffler/powr/tree/master/packages/crypt): Cryptography (TweetNACL)

### Style

* [@powr/fela](https://github.com/bkniffler/powr/tree/master/packages/fela): Fela CSS-in-JS

### Services

* [@powr/auth0](https://github.com/bkniffler/powr/tree/master/packages/auth0): Auth0 plugin
* [@powr/apollo](https://github.com/bkniffler/powr/tree/master/packages/apollo): Apollo plugin

## Motivation

## Contributing

Contributions always welcome, feel free to PR with new features/plugins or bugfixes if you like.

## Ref

* [react](https://github.com/react/react): React
