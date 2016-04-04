//thanks to https://github.com/B-Stefan/node-jira-worklog-export
const _ = require('lodash');
const moment = require('moment');
const argvToRepDate = require('./lib/utils').argvToRepDate;
const adjustWorkingTime = require('./lib/utils').adjustWorkingTime;
const config = require('./lib/utils').config;
const argv = require('optimist').argv;
const generateReport = require('./lib/generate-report');
const writeExcelReport = require('./lib/excel-report-writter').writeExcelReport;

var startDate, endDate;

function writeReport(dates) {
    generateReport(dates).then((result) => {
        result.summary.map((item) => console.log(_.padEnd(item.author, 20), _.padEnd(item.sum, 3)) );
        console.log('---');
        _.each(result.details, (items, author) => {
            console.log(author);
            _.each(_.sortBy(items, (i) => i.started ), (item) => {
                console.log('  ', `${item.started.format(config.reportDateFormat)} | ${ _.padStart(item.timeSpent, 10)} | ${item.issue.key} | ${_.padEnd(_.truncate(item.comment.replace(/\n/g, ' '), {length: 20}), 20)} | ${_.truncate(item.issue.fields.summary, {length: 20})} `);
            });
        });

        var filename = `time-${dates.startDate.format(config.repFileNameDate)}—to—${dates.endDate.format(config.repFileNameDate)}`;
        writeExcelReport(filename, result)
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
