# node-fetch-http-proxy
The node-fetch library with added HTTP_PROXY, HTTPS_PROXY, NO_PROXY support, same as the deprecated request.js library had.

## Usage
To install this library, just type the following.

```
npm install --save @formio/node-fetch-http-proxy
```

Then you can use this library instead of node-fetch like so.

```js
const fetch = require('@formio/node-fetch-http-proxy');

fetch('https://examples.form.io/example').then((resp) => resp.json()).then((form) => {
  console.log(form);
});;
```

## HTTP_PROXY, HTTPS_PROXY, and NO_PROXY
These variables work the same as documented @ https://github.com/request/request#controlling-proxy-behaviour-using-environment-variables
