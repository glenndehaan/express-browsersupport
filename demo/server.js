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
 * Configure app to use bodyParser()
 */
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

/**
 * Configure app to use Browser Support
 */
app.use(browsersupport({
    debug: false,
    ignoreUndefinedBrowsers: false,
    redirectUrl: "/oldbrowser",
    supportedBrowsers: [
        "Chrome >= 52",
        "Firefox >= 47",
        "Safari >= 10",
        "Edge == All",
        "IE == 11"
    ]
}));

/**
 * Render homepage
 */
app.get('/', (req, res) => {
    res.send("Home");
});

/**
 * Render fallback
 */
app.get('/oldbrowser', (req, res) => {
    res.send("Old browser!");
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
