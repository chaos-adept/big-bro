const moment = require('moment');
const _ = require('lodash');
const loadConfig = require('./config-utils').loadConfig;



function argvToRepDate(cmdDate) {
    var date = moment(cmdDate, loadConfig().cmdArgDateFormat);
    return adjustWorkingTime(date);
}

function adjustWorkingTime(date) {
    date.hour(loadConfig().startWorkingHour);
    date.minutes(0);
    return date;
}

module.exports = { argvToRepDate:argvToRepDate, loadConfig: loadConfig, adjustWorkingTime: adjustWorkingTime };