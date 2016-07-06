const moment = require('moment');
const _ = require('lodash');
const _config = require('./config-utils').loadConfig();



function argvToRepDate(cmdDate) {
    var date = moment(cmdDate, _config.cmdArgDateFormat);
    return adjustWorkingTime(date);
}

function adjustWorkingTime(date) {
    date.hour(_config.startWorkingHour);
    date.minutes(0);
    return date;
}

module.exports = { argvToRepDate:argvToRepDate, config: _config, adjustWorkingTime: adjustWorkingTime };