const moment = require('moment');
const _ = require('lodash');
const _config = loadConfig();

function loadConfig() {
    const defaultConfigName = './../config.default.js';
    const localConfigName = './../config.local.js';
    const defaultConfig = require(defaultConfigName);

    try {
        var moduleConfig = require(localConfigName);
        return _.merge(defaultConfig, moduleConfig);
    } catch (e) {
        console.error(`${localConfigName} is not found, please create it with custom parameters from ${defaultConfigName}`);
        throw e;
    }
}

function argvToRepDate(cmdDate) {
    var date = moment(cmdDate, _config.cmdArgDateFormat);
    date.hour(_config.startWorkingHour);
    date.minutes(0);
    return date;
}

module.exports = { argvToRepDate, config: _config };