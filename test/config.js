// Patch stupid jest console.log behavior back to a normal console output.
beforeEach(() => { global.console = require('console') });
