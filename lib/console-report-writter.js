const _ = require('lodash');
const moment = require('moment');
const stringReportWritter = require('./string-report-writer');
const config = require('./config-utils').loadConfig();

function WriteConsoleReport(options) {
    console.log(stringReportWritter(options));
}

module.exports = WriteConsoleReport;