const { get, castArray } = require('lodash');
// require('babel-register');

module.exports = templateParams => `
  <!DOCTYPE html>
  <html lang="de">
    <head>
      <meta charset="utf-8">
      ${
        process.env.BUILD_ON
          ? `<meta name="build-on" content="${process.env.BUILD_ON}">`
          : ''
      }
      <meta name="viewport" content="width=device-width,minimum-scale=1,initial-scale=1">
      <meta http-equiv="x-ua-compatible" content="ie=edge">
      <meta http-equiv="Content-Language" content="de" />
      <link rel="manifest" href="/manifest.json">
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
      <link rel="manifest" href="/site.webmanifest">
      <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#31319d">
      <meta name="msapplication-TileColor" content="#31319d">
      <meta name="theme-color" content="#31319d">
      ${castArray(get(templateParams, 'htmlWebpackPlugin.files.css.0', [])).map(
        style => `<link rel="stylesheet" type="text/css" href="${style}">`
      )}
      <style id="css-markup"></style>
    </head>
    <body>
      <div id="app"></div>
      ${castArray(get(templateParams, 'htmlWebpackPlugin.files.js.0', [])).map(
        script => `<script async src="${script}"></script>`
      )}
    </body>
  </html>
`;
