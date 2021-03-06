'use strict';

//thanks to https://github.com/B-Stefan/node-jira-worklog-export
const _ = require('lodash');
const moment = require('moment');
const argvToRepDate = require('./lib/utils').argvToRepDate;
const adjustWorkingTime = require('./lib/utils').adjustWorkingTime;
const configUtils = require('./lib/config-utils');
const argv = require('optimist').argv;
const generateReport = require('./lib/generate-report');
const log4js = require('log4js');
const assert = require('assert');

log4js.configure('log4js_configuration.json');

var startDate, endDate;

function writeReport(input) {
    generateReport(input.dates).then((result) => {
        var options = Object.assign(input, { result });
        const config = configUtils.loadConfig();
        for (var writeReport of config.reporters.map((module) => require(module))) {
            writeReport(options);
        }
    });
}

function reportForDay(startDate, stereotype) {
    var endDate = startDate.clone();
    endDate.add(1, 'd');
    writeReport({
        dates: {
            startDate: adjustWorkingTime(startDate),
            endDate: adjustWorkingTime(endDate)
        },
        stereotype
    });
}

function reportForDuration(startDate, endDate, stereotype) {
    var shftEndDate = endDate.clone();
    shftEndDate.add(1, 'd');
    writeReport({
        dates: {
            startDate: adjustWorkingTime(startDate),
            endDate: adjustWorkingTime(shftEndDate)
        },
        stereotype
    });
}

function reportToday() {
    reportForDay(moment(), 'today');
}

function reportYesterday() {
    var yesterday = moment().subtract(1, 'd');
    reportForDay(yesterday, 'yesterday');
}

function reportWeek() {
    reportForDuration(moment().startOf('isoWeek'), moment().endOf('isoWeek'), 'this week');
}

function reportPrevWeek() {
    reportForDuration(
        moment().startOf('isoWeek').subtract(1, 'w'),
        moment().endOf('isoWeek').subtract(1, 'w'),
        'prev. week'
    );
}

function reportTwoWeeks() {
    reportForDuration(
        moment().startOf('isoWeek').subtract(2, 'w'),
        moment().endOf('isoWeek').subtract(1, 'w'),
        'two week ago'
    );
}

function reportProgressByQuery(query) {
    require('./lib/generate-progress-report')(query);
}

function generateLocalConfig() {
    assert(argv.user, 'jira `user` should be defined');
    assert(argv.password, 'jira `password` should be defined');
    assert(argv.host, 'jira `host` should be defined in the format like - `domain.com`');
    assert(argv.projectKeys, 'jira `projectKeys` should be defined in the format like - `AS,WPPAP`');
    configUtils.makeDefaultConfig(argv);
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
    case 'twoWeeks':
        reportTwoWeeks();
        break;
    case 'week':
        reportWeek();
        break;
    case 'query':
        reportProgressByQuery(argv.query);
        break;
    case 'setup-local-config':
        generateLocalConfig();
        break;
    case undefined:
        console.error(`cmd argument must be specified`);
        break;
    default:
        throw new Error(`Unknown action ${argv.cmd}`)
}
