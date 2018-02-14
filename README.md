# Express BrowserSupport

A way to define which browsers are supported in your express app

[![npm](https://img.shields.io/npm/v/express-browsersupport.svg)](https://www.npmjs.com/package/express-browsersupport) ![node](https://img.shields.io/node/v/express-browsersupport.svg) ![dependencies](https://david-dm.org/glenndehaan/express-browsersupport.svg) [![Build Status](https://travis-ci.org/glenndehaan/express-browsersupport.svg?branch=master)](https://travis-ci.org/glenndehaan/express-browsersupport) [![Coverage Status](https://coveralls.io/repos/github/glenndehaan/express-browsersupport/badge.svg?branch=master)](https://coveralls.io/github/glenndehaan/express-browsersupport?branch=master)

## Functionalities
* Check if browsers visiting your express app are supported by you.
* Redirect old browsers to a fallback page.

## Setup
Install the Express BrowserSupport package:
```
npm install express-browsersupport
```
Require the Express BrowserSupport package somewhere in your code:
```
const browsersupport = require('express-browsersupport');
```

## Usage
The Express BrowserSupport package contains three modes. The let us redirect them mode, the send a custom response to them mode and the do it yourself mode.

Start by just setting up a basic express server:
```
const express = require('express');
const app = express();
```

#### Redirect
By specifying the `redirectUrl` param in the options we will redirect browsers who arn't supported to another url
```
app.use(browsersupport({
    redirectUrl: "/oldbrowser",
    supportedBrowsers: [
        "Chrome >= 52",
        "Firefox >= 47",
        "Safari >= 10",
        "Edge == All",
        "IE == 11"
    ]
}));
 
app.get('/', (req, res) => {
    // Supported browsers will endup in your own defined Express Routes
    res.send("Home");
});
 
app.get('/oldbrowser', (req, res) => {
    // Everything else here!
    res.send("Go away!");
});
```

#### Custom Response
By specifying the `customResponse` param in the options we will send your custom HTML response to browsers who arn't supported
```
// Non supported browsers will get this as a response (A custom HTML page)
const oldBrowserResponse = `
    <html>
        <head>
            <title>Old Browser</title>
        </head>
        <body>
            <h2><strong>Go away!</strong></h2>
        </body>
    </html>
`;
 
app.use(browsersupport({
    customResponse: oldBrowserResponse,
    supportedBrowsers: [
        "Chrome >= 52",
        "Firefox >= 47",
        "Safari >= 10",
        "Edge == All",
        "IE == 11"
    ]
}));
 
app.get('/', (req, res) => {
    // Supported browsers will endup in your own defined Express Routes
    res.send("Home");
});
```

#### Do it yourself
If you don't specify the `customResponse` or `redirectUrl` in your options you will have to do it yourself

Your req variable will always contain a special browserSupported boolean

This variable is always available! Even if you specify a `customResponse` or `redirectUrl` in your options

This means you are free to do what ever you want
```
app.use(browsersupport({
    supportedBrowsers: [
        "Chrome >= 52",
        "Firefox >= 47",
        "Safari >= 10",
        "Edge == All",
        "IE == 11"
    ]
}));
 
app.get('/', (req, res) => {
    console.log(req.supportedBrowser); // Return's true / false
    res.send("Home!");
});
```

## Supported Browsers
This array can be filled with strings that will contain the browser checks.

So the order is `"Browser Name"` `"Operator"` `"Version"`

The following operators are supported: `>` `>=` `==`

Instead of a version number you can also use `All` this means all versions from that browser are supported

This array is required and needs to have at least one rule

## Strict Mode
By default when a browser visits that isn't defined in the supported browsers array

We will allow this. But sometimes you don't want to also disallow these browsers

> Warning!!! This also disallows bot's trying to visit the URL

When set to `true` and someone with an undefined browser visits the app the browser will not be allowed
```
app.use(browsersupport({
    useStrictMode: true // Defaults to false
}));
```

## Debug
Found a weird new browser and want to check what express-useragent returns. Sure just set debug to `true`:
```
app.use(browsersupport({
    debug: true // Defaults to false
}));
```

## Bonus
Since we are using express-useragent to determent the current browser.

We also add this to your express setup. So no need to require this. Just do:
```
app.get('/', (req, res) => {
    console.log(req.useragent);
    res.send("Home");
});
```

## License

MIT
