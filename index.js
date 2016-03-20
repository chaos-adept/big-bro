//thanks to https://github.com/B-Stefan/node-jira-worklog-export
const moment = require('moment');
const argvToRepDate = require('./lib/utils').argvToRepDate;
const config = require('./lib/utils').config;
const argv = require('optimist').argv;
const generateReport = require('./lib/generate-report');
const writeExcelReport = require('./lib/excel-report-writter').writeExcelReport;

var startDate, endDate;

function writeReport(dates) {
    generateReport(dates).then((result) => {
        var filename = `time-${dates.startDate.format(config.repFileNameDate)}—to—${dates.endDate.format(config.repFileNameDate)}`;
        writeExcelReport(filename, result)
    });
}

if (argv.day) {
    startDate = argvToRepDate(argv.day);
    endDate = startDate.clone();
    endDate.add(1, 'd');
    writeReport({startDate, endDate});
} else if (argv.startDate && argv.endDate) {
    startDate = argvToRepDate(argv.startDate);
    endDate = argvToRepDate(argv.endDate);
    endDate.add(1, 'd');
    writeReport({startDate, endDate});
} else {
    console.log('no action specified')
}

