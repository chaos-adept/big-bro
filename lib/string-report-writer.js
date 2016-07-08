'use strict';

const _ = require('lodash');
const moment = require('moment');
const config = require('./config-utils').loadConfig();

function WriteStringReportToHandler(options, writer) {
    var result = options.result;
    var summary = _.sortBy(result.summary, (i) => i.sum);
    var details = result.details;
    summary.map((item) => {
        const duration = moment.duration(item.sum, 'seconds');
        writer(_.padEnd(item.author, 20), `${Math.floor(duration.asHours())}h ${_.padStart(duration.minutes(), 2, '0')}m`);

    });
    writer('---');
    summary.map((item) => {
        const author = item.author;
        const items = details[author];
        writer(author);
        _.each(_.sortBy(items, (i) => i.started ), (item) => {
            writer('  ', `${item.started.format(config.reportDateFormat)} | ${ _.padStart(item.timeSpent, 6)} | ${item.issue.key} | ${_.padEnd(_.truncate(item.comment.replace(/(\n|\r)/g, '/ '), {length: 30}), 30)} | ${_.truncate(item.issue.fields.summary, {length: 20})} `);
        });
    });
}

function WriteStringReport(options) {
    var result = "";
    WriteStringReportToHandler(options, function () {
        var args = [].slice.call(arguments);
        result += "\r\n" + args.join(' ');
    });
    return result;
}

module.exports = WriteStringReport;