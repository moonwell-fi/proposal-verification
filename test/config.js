// Patch stupid jest console.log behavior back to a normal console output.
const ethers = require("ethers")
const realConsole = require("console");
const fs = require("fs");
const path = require("path");

const ARTIFACT_DIR = './artifacts/'

beforeEach(() => {
    ethers.utils.Logger.setLogLevel(ethers.utils.Logger.levels.ERROR)

    // Magic sauce to go drop test results into ARTIFACT_DIR for upload to github
    if (!fs.existsSync(ARTIFACT_DIR)){
        fs.mkdirSync(ARTIFACT_DIR);
    }

    const testName = expect.getState().currentTestName
    const artifactName = `${testName}.txt`
    const logOutputFile = path.join(ARTIFACT_DIR, artifactName)

    if (fs.existsSync(logOutputFile)){
        fs.rmSync(logOutputFile);
    }

    const fileOptions = {
        encoding: "utf8",
        flag: "a+",
    }
    const handler = {
        get(target, prop, receiver) {
            // If calling console.log, also log to file for upload as part of github actions runs
            if (prop === "log"){
                return function (...args) {
                    fs.writeFileSync(
                        logOutputFile,
                        args.map(i => i.toString()).join(' ') + "\n",
                        fileOptions
                    )
                    return target[prop].apply(target, args);
                }
            }
            return Reflect.get(target, prop, receiver);
        }
    }

    global.console = new Proxy(realConsole, handler)
});
