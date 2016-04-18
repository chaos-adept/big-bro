const _ = require('lodash');

function loadConfig() {
    const defaultConfigName = './../config.default.js';
    const localConfigName = './../config.local.js';
    const defaultConfig = require(defaultConfigName);
    var moduleConfig;
    try {
        moduleConfig = require(localConfigName);
    } catch (e) {
        console.error(`${localConfigName} is not found, please create it with custom parameters from ${defaultConfigName}`);
        throw e;
    }

    return _.merge(defaultConfig, moduleConfig);
}

module.exports = loadConfig();