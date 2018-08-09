'use strict';

const _ = require('lodash');
const moment = require('moment');
const config = require('./config-utils').loadConfig();

const formatSeconds = (seconds) => {
    const duration = moment.duration(seconds, 'seconds');
    return`${Math.floor(duration.asHours())}h ${_.padStart(duration.minutes(), 2, '0')}m`;
};

function WriteStringReportToHandler(options, writer) {
    var result = options.result;
    var summary = _.sortBy(result.summary, (i) => i.sum);
    var details = result.details;
    summary.map((item) => {
        writer(_.padEnd(item.author, 20), formatSeconds(item.sum));
    });
    writer('---');
    summary.map((item) => {
        const author = item.author;
        const items = details[author];
        const dayGroupItems = _.groupBy(items, i => i.started.format("YYYY-MM-DD"));
        const days = [];
        _.each(dayGroupItems, (items, day) => days.push({day, items}));
        const sortedDays = _.sortBy(days, i => i.day);

        writer(author);
        _.each(sortedDays, ({items, day}) => {
            writer(day, formatSeconds(_.sumBy(items, i => i.timeSpentSeconds)));
        });
        _.each(sortedDays, ({items, day}) => {
            _.each(_.sortBy(items, (i) => i.started ), (item) => {
                writer(_.truncate(item.author.displayName, { length: 14, omission: '.' }), `${item.started.format(config.reportDateFormat)} | ${ _.padStart(item.timeSpent, 6)} | ${item.issue.key} | ${_.padEnd(_.truncate(item.comment.replace(/(\n|\r)/g, '/ '), {length: 30}), 30)} | ${_.truncate(item.issue.fields.summary, {length: 20})} `);
            });
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