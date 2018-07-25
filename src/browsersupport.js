/**
 * Import dependencies
 */
const useragent = require('express-useragent');

/**
 * Define globals
 */
let supportedBrowsers = [];
let useStrictMode = false;
let debug = false;

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

    if (options.redirectUrl && options.customResponse) {
        throw new Error("[BrowserSupport] You can only use one feature at once! Define redirectUrl or customResponse. Not both!");
    }

    if (typeof options.debug !== "undefined") {
        debug = options.debug;
    }

    if (typeof options.useStrictMode !== "undefined") {
        useStrictMode = options.useStrictMode;
    }

    supportedBrowsers = options.supportedBrowsers;
    validateBrowserList();

    /**
     * Return the Express middleware function
     */
    return (req, res, next) => {
        /**
         * If the user-agent lib crashes we use the strict mode fallback
         */
        try {
            const source = req.headers['user-agent'];
            req.useragent = useragent.parse(source);
        } catch (e) {
            req.supportedBrowser = !useStrictMode;
            req.useragent = false;

            next();
            return;
        }

        /**
         * Add req.supportedBrowser
         */
        attachBrowserSupport(req);

        if (debug) {
            console.log("----------------------------------------------------");
            console.log(`[BrowserSupport] Browser: ${req.useragent.browser}`);
            if (typeof req.useragent.version !== "undefined" && typeof req.useragent.version.split === "function" && typeof req.useragent.browser !== "undefined") {
                console.log(`[BrowserSupport] Version: ${req.useragent.version.split(".")[0]}`);
            }
            console.log("----------------------------------------------------");
        }

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
            // Check if the user wants to return a custom response for old browsers
        } else if (typeof options.customResponse !== "undefined") {
            if (!isSupportedBrowser(req.useragent)) {
                res.send(options.customResponse);
            } else {
                next();
            }
            // If nothing is defined we just continue
        } else {
            next();
        }
    }
};

/**
 * Check the browser list on app init. This makes sure you don't miss any error's
 */
const validateBrowserList = () => {
    for (let browser = 0; browser < supportedBrowsers.length; browser++) {
        convertStringToBrowser(supportedBrowsers[browser]);
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
            if (typeof ua.version === "undefined" || typeof ua.version.split !== "function" || typeof ua.browser === "undefined") {
                return !useStrictMode;
            }

            const currentBrowserVersion = parseInt(ua.version.split(".")[0]);

            if (ua.browser.toLowerCase() === supportedBrowser.browser.toLowerCase()) {
                if (supportedBrowser.operator === "==") {
                    return (currentBrowserVersion == supportedBrowser.version);
                }

                if (supportedBrowser.operator === ">=") {
                    return (currentBrowserVersion >= supportedBrowser.version);
                }

                if (supportedBrowser.operator === ">") {
                    return (currentBrowserVersion > supportedBrowser.version);
                }
            }
        } else {
            if (ua.browser.toLowerCase() === supportedBrowser.browser.toLowerCase()) {
                return (ua.browser.toLowerCase() === supportedBrowser.browser.toLowerCase());
            }
        }
    }

    return !useStrictMode;
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
