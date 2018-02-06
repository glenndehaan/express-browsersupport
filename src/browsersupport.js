/**
 * Import dependencies
 */
const useragent = require('express-useragent');

/**
 * Create globals
 *
 * @type {Array}
 */
let supportedBrowsers = [];

/**
 * Express middleware
 *
 * @param options
 * @return {function(*=, *, *)}
 */
const browserSupportMiddleware = (options) => {
    if (typeof options.supportedBrowsers === "undefined") {
        throw new Error("[BrowserSupport] Missing supportedBrowsers array!");
    }

    if (options.supportedBrowsers.length < 1) {
        throw new Error("[BrowserSupport] Missing browsers in supportedBrowsers array!");
    }

    supportedBrowsers = options.supportedBrowsers;

    /**
     * Return the Express middleware function
     */
    return (req, res, next) => {
        const source = req.headers['user-agent'];
        req.useragent = useragent.parse(source);

        // Check if the user wants to do a redirect for old browsers
        if (typeof options.redirectUrl !== "undefined") {
            if (!isSupportedBrowser(req.useragent)) {
                if (req.path !== options.redirectUrl) {
                    res.redirect(options.redirectUrl);
                } else {
                    next();
                }
            } else {
                next();
            }
        } else {
            attachBrowserSupport(req);
            next();
        }
    }
};

/**
 * Add the supported browser result to the express request
 *
 * @param req
 */
const attachBrowserSupport = (req) => {
    req.supportedBrowser = isSupportedBrowser(req.useragent);
};

/**
 * Checks if the browser is supported
 *
 * @param ua
 * @return {boolean}
 */
const isSupportedBrowser = (ua) => {
    for (let browser = 0; browser < supportedBrowsers.length; browser++) {
        const supportedBrowser = convertStringToBrowser(supportedBrowsers[browser]);

        if (supportedBrowser.version !== "All") {
            const currentBrowserVersion = parseInt(ua.version.split(".")[0]);

            if (ua.browser.toLowerCase() === supportedBrowser.browser.toLowerCase()) {
                if (supportedBrowser.operator === "==") {
                    return (currentBrowserVersion === supportedBrowser.version);
                }

                if (supportedBrowser.operator === ">=") {
                    return (currentBrowserVersion >= supportedBrowser.version);
                }

                if (supportedBrowser.operator === ">") {
                    return (currentBrowserVersion > supportedBrowser.version);
                }
            }
        } else {
            return (ua.browser.toLowerCase() === supportedBrowser.browser.toLowerCase());
        }
    }

    return false;
};

/**
 * Splits a complete browser check string into parts and verify's if it is correct
 *
 * @param browserString
 * @return {{browser: *|string, operator: *|string, version: *|string}}
 */
const convertStringToBrowser = (browserString) => {
    const splicedString = browserString.split(" ");

    if (splicedString.length === 3) {
        const browser = splicedString[0];
        const operator = splicedString[1];
        const version = splicedString[2];

        if (operator !== "==" && operator !== ">=" && operator !== ">") {
            throw new Error(`[BrowserSupport] Incorrect operator! Please correct this line: '${browserString}'`);
        }

        return {browser, operator, version};
    } else {
        throw new Error(`[BrowserSupport] Incorrect browser check! Please correct this line: '${browserString}'`);
    }
};

module.exports = browserSupportMiddleware;
