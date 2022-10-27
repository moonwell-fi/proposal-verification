// Patch stupid jest console.log behavior back to a normal console output.
const ethers = require("ethers")

beforeEach(() => {
    global.console = require('console')
    ethers.utils.Logger.setLogLevel(ethers.utils.Logger.levels.ERROR)
});
