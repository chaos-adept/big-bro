const _ = require('lodash');
const defaultConfigName = './../config.default.js';
const localConfigName = './../config.local.js';
const defaultConfig = require(defaultConfigName);
const fs = require('fs');
const path = require('path');

function makeDefaultConfig(args) {
    const {user, password, host, projectKeys:projectKeysRaw} = args;
    const projKeys = projectKeysRaw.split(',').map(_.trim);

    const newConfig = JSON.stringify({
        jira: {
            "userName": user,
            "password": password,
            "host": host,
            "projectKey": projKeys
        }
    }, null, 2);
    var filePath = path.resolve(__dirname, localConfigName);
    fs.writeFile(filePath, `module.exports = ${newConfig};`, (err) => {
        if (err) throw err;
        console.log(`${filePath} saved!`);
    });
}

function loadConfig() {
    var moduleConfig;
    try {
        moduleConfig = require(localConfigName);
    } catch (e) {
        console.error(`${localConfigName} is not found, please create it with custom parameters from ${defaultConfigName}`);
        throw e;
    }

    var result = _.merge(defaultConfig, moduleConfig);

    return result;
}

module.exports = {
    loadConfig: loadConfig,
    makeDefaultConfig: makeDefaultConfig
};
