//thanks to https://github.com/B-Stefan/node-jira-worklog-export
const _ = require('lodash');
const moment = require('moment');
const argvToRepDate = require('./lib/utils').argvToRepDate;
const adjustWorkingTime = require('./lib/utils').adjustWorkingTime;
const config = require('./lib/config-utils');
const argv = require('optimist').argv;
const generateReport = require('./lib/generate-report');
const log4js = require('log4js');
log4js.configure('log4js_configuration.json');

var startDate, endDate;

function writeReport(dates) {
    generateReport(dates).then((result) => {
        var options = { dates, result };
        for (var writeReport of config.reporters.map( (module) => require(module) )) {
            writeReport(options);
        }
    });
}

function reportForDay(startDate) {
    var endDate = startDate.clone();
    endDate.add(1, 'd');
    writeReport({
        startDate: adjustWorkingTime(startDate),
        endDate: adjustWorkingTime(endDate)
    });
}

function reportForDuration(startDate, endDate) {
    var shftEndDate = endDate.clone();
    shftEndDate.add(1, 'd');
    writeReport({
        startDate: adjustWorkingTime(startDate),
        endDate: adjustWorkingTime(shftEndDate)
    });
}

function reportToday() {
    reportForDay(moment());
}

function reportYesterday() {
    var yesterday = moment().subtract(1, 'd');
    reportForDay(yesterday);
}

function reportWeek() {
    reportForDuration(moment().startOf('isoWeek'), moment().endOf('isoWeek'));
}

function reportPrevWeek() {
    reportForDuration(
        moment().startOf('isoWeek').subtract(1, 'w'),
        moment().endOf('isoWeek').subtract(1, 'w'));
}

switch (argv.cmd) {
    case 'day':
        console.log(`generate for day ${argv.day}`);
        startDate = argvToRepDate(argv.day);
        reportForDay(startDate);
        break;
    case 'period':
        startDate = argvToRepDate(argv.startDate);
        endDate = argvToRepDate(argv.endDate);
        reportForDuration(startDate, endDate);
        break;
    case 'today':
        reportToday();
        break;
    case 'yesterday':
        reportYesterday();
        break;
    case 'prevWeek':
        reportPrevWeek();
        break;
    case 'week':
        reportWeek();
        break;
    case undefined:
        console.error(`cmd argument must be specified`);
        break;
    default:
        throw new Error(`Unknown action ${argv.cmd}`)
}
