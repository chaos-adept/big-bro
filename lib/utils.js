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

function toHours(seconds) {
    return seconds / 60 / 60;
}


module.exports = { argvToRepDate:argvToRepDate, loadConfig: loadConfig, adjustWorkingTime: adjustWorkingTime, toHours };
