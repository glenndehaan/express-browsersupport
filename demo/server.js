/**
 * Import base packages
 */
const express = require('express');
const app = express();
const bodyParser = require('body-parser');

/**
 * Import own packages
 */
const browsersupport = require('../src/browsersupport');

/**
 * Define old browser response
 */
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

/**
 * Configure app to use bodyParser()
 */
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

/**
 * Configure app to use Browser Support
 */
app.use(browsersupport({
    debug: false,
    useStrictMode: false,
    // redirectUrl: "/oldbrowser",
    customResponse: oldBrowserResponse,
    supportedBrowsers: [
        "Chrome >= 41",
        "Firefox >= 13",
        "Safari >= 10",
        "IE == 11",
        "Edge == All"
    ]
}));

/**
 * Render homepage
 */
app.get('/', (req, res) => {
    console.log('req.supportedBrowser', req.supportedBrowser);

    res.send("Home");
});

/**
 * Render fallback
 */
app.get('/oldbrowser', (req, res) => {
    res.send(oldBrowserResponse);
});

/**
 * Setup default 404 message
 */
app.use((req, res) => {
    res.status(404);
    res.send("Not found!");
});

/**
 * Disable powered by header for security reasons
 */
app.disable('x-powered-by');

/**
 * Start listening on port
 */
const server = app.listen(8081, "0.0.0.0", () => {
    console.log(`[NODE] App is running on: 0.0.0.0:8081`);
});

/**
 * Handle nodemon shutdown
 */
process.once('SIGUSR2', () => {
    server.close(() => {
        console.log(`[NODE] Express exited! Port 8081 is now free!`);
        process.kill(process.pid, 'SIGUSR2');
    });
});
