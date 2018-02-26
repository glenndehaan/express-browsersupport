/**
 * Import test suite
 */
const should = require('should');
const request = require('request');

/**
 * Import packages needed for tests
 */
const express = require('express');
const browsersupport = require('../src/browsersupport');

/**
 * Define local request options
 * @type {{url: string, headers: {"User-Agent": string}}}
 */
const requestOptions = {
    url: 'http://localhost:8082/',
    headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.13; rv:58.0) Gecko/20100101 Firefox/58.0'
    }
};

describe("BrowserSupport", () => {
    /**
     * Just startup the server with the package
     */
    it('Should be able to start express without error', (done) => {
        const app = express();

        app.use(browsersupport({
            supportedBrowsers: [
                "Chrome >= 52",
                "Firefox >= 47",
                "Safari >= 10",
                "Edge == All",
                "IE == 11"
            ]
        }));

        const server = app.listen(8082, "0.0.0.0", () => {
            server.close(() => {
                done();
            });
        });
    });

    /**
     * Check if we can open the home page with a supported browser
     */
    it('Should view a page on a normal browser', (done) => {
        const app = express();

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
            res.send("Home");
        });

        const server = app.listen(8082, "0.0.0.0", () => {
            request(requestOptions, (error, response, body) => {
                response.statusCode.should.be.Number();
                response.statusCode.should.equal(200);
                body.should.equal("Home");

                server.close(() => {
                    done();
                });
            });
        });
    });

    /**
     * Check if we get the fallback page when using an unsupported browser
     */
    it('Should get a fallback when using an old browser', (done) => {
        const app = express();

        app.use(browsersupport({
            customResponse: "Old Browser",
            supportedBrowsers: [
                "Chrome >= 52",
                "Firefox >= 80",
                "Safari >= 10",
                "Edge == All",
                "IE == 11"
            ]
        }));

        app.get('/', (req, res) => {
            res.send("Home");
        });

        const server = app.listen(8082, "0.0.0.0", () => {
            request(requestOptions, (error, response, body) => {
                response.statusCode.should.be.Number();
                response.statusCode.should.equal(200);
                response.req.path.should.equal("/");
                body.should.equal("Old Browser");

                server.close(() => {
                    done();
                });
            });
        });
    });

    /**
     * Check if we get a redirect when using an unsupported browser
     */
    it('Should redirect when using an old browser', (done) => {
        const app = express();

        app.use(browsersupport({
            redirectUrl: "/oldbrowser",
            supportedBrowsers: [
                "Chrome >= 52",
                "Firefox >= 80",
                "Safari >= 10",
                "Edge == All",
                "IE == 11"
            ]
        }));

        app.get('/', (req, res) => {
            res.send("Home");
        });

        app.get('/oldbrowser', (req, res) => {
            res.send("Old Browser");
        });

        const server = app.listen(8082, "0.0.0.0", () => {
            request(requestOptions, (error, response, body) => {
                response.statusCode.should.be.Number();
                response.statusCode.should.equal(200);
                response.req.path.should.equal("/oldbrowser");
                body.should.equal("Old Browser");

                server.close(() => {
                    done();
                });
            });
        });
    });

    /**
     * Check if are allowed when the User-Agent is malformed
     */
    it('Should allow malformed User-Agent', (done) => {
        const app = express();

        app.use(browsersupport({
            redirectUrl: "/oldbrowser",
            supportedBrowsers: [
                "Chrome >= 52",
                "Firefox >= 80",
                "Safari >= 10",
                "Edge == All",
                "IE == 11"
            ]
        }));

        app.get('/', (req, res) => {
            res.send("Home");
        });

        app.get('/oldbrowser', (req, res) => {
            res.send("Old Browser");
        });

        requestOptions.headers["User-Agent"] = "Firefox";

        const server = app.listen(8082, "0.0.0.0", () => {
            request(requestOptions, (error, response, body) => {
                response.statusCode.should.be.Number();
                response.statusCode.should.equal(200);
                response.req.path.should.equal("/");
                body.should.equal("Home");

                server.close(() => {
                    done();
                });
            });
        });
    });

    /**
     * Check if are allowed when the User-Agent is empty
     */
    it('Should allow empty User-Agent', (done) => {
        const app = express();

        app.use(browsersupport({
            redirectUrl: "/oldbrowser",
            supportedBrowsers: [
                "Chrome >= 52",
                "Firefox >= 80",
                "Safari >= 10",
                "Edge == All",
                "IE == 11"
            ]
        }));

        app.get('/', (req, res) => {
            res.send("Home");
        });

        app.get('/oldbrowser', (req, res) => {
            res.send("Old Browser");
        });

        requestOptions.headers["User-Agent"] = "";

        const server = app.listen(8082, "0.0.0.0", () => {
            request(requestOptions, (error, response, body) => {
                response.statusCode.should.be.Number();
                response.statusCode.should.equal(200);
                response.req.path.should.equal("/");
                body.should.equal("Home");

                server.close(() => {
                    done();
                });
            });
        });
    });

    it('Should redirect when unknown browser visits in strict mode', (done) => {
        const app = express();

        app.use(browsersupport({
            redirectUrl: "/oldbrowser",
            useStrictMode: true,
            supportedBrowsers: [
                "Chrome >= 52",
                "Firefox >= 80",
                "Safari >= 10",
                "Edge == All",
                "IE == 11"
            ]
        }));

        app.get('/', (req, res) => {
            res.send("Home");
        });

        app.get('/oldbrowser', (req, res) => {
            res.send("Old Browser");
        });

        requestOptions.headers["User-Agent"] = "";

        const server = app.listen(8082, "0.0.0.0", () => {
            request(requestOptions, (error, response, body) => {
                response.statusCode.should.be.Number();
                response.statusCode.should.equal(200);
                response.req.path.should.equal("/oldbrowser");
                body.should.equal("Old Browser");

                server.close(() => {
                    done();
                });
            });
        });
    });

    it('Should crash when array is missing', (done) => {
        try {
            browsersupport({});
        } catch (e) {
            e.should.Error();
            done();
        }
    });

    it('Should crash when no supportedBrowsers are in the array', (done) => {
        try {
            browsersupport({
                supportedBrowsers: []
            });
        } catch (e) {
            e.should.Error();
            done();
        }
    });

    it('Should crash when 2 responses are defined', (done) => {
        try {
            browsersupport({
                customResponse: "Old Browser",
                redirectUrl: "/oldbrowser",
                supportedBrowsers: [
                    "Chrome >= 52",
                    "Firefox >= 80",
                    "Safari >= 10",
                    "Edge == All",
                    "IE == 11"
                ]
            });
        } catch (e) {
            e.should.Error();
            done();
        }
    });

    it('Should crash when wrong browser string is given', (done) => {
        try {
            browsersupport({
                supportedBrowsers: [
                    "Chrome52",
                    "Firefox >= 80",
                    "Safari >= 10",
                    "Edge == All",
                    "IE == 11"
                ]
            });
        } catch (e) {
            e.should.Error();
            done();
        }
    });

    it('Should crash when wrong operator string is given', (done) => {
        try {
            browsersupport({
                supportedBrowsers: [
                    "Chrome = 52",
                    "Firefox >= 80",
                    "Safari >= 10",
                    "Edge == All",
                    "IE == 11"
                ]
            });
        } catch (e) {
            e.should.Error();
            done();
        }
    });

    /**
     * Check if are allowed when the User-Agent is undefined
     */
    it('Should allow undefined User-Agent (express-useragent crash simulation)', (done) => {
        const app = express();

        app.use(browsersupport({
            redirectUrl: "/oldbrowser",
            supportedBrowsers: [
                "Chrome >= 52",
                "Firefox >= 80",
                "Safari >= 10",
                "Edge == All",
                "IE == 11"
            ]
        }));

        app.get('/', (req, res) => {
            res.send("Home");
        });

        app.get('/oldbrowser', (req, res) => {
            res.send("Old Browser");
        });

        delete requestOptions.headers;

        const server = app.listen(8082, "0.0.0.0", () => {
            request(requestOptions, (error, response, body) => {
                response.statusCode.should.be.Number();
                response.statusCode.should.equal(200);
                response.req.path.should.equal("/");
                body.should.equal("Home");

                server.close(() => {
                    done();
                });
            });
        });
    });
});
