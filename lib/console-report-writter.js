const _ = require('lodash');
const moment = require('moment');
const config = require('./config-utils').loadConfig();

function WriteConsoleReport(options) {
    var result = options.result;
    var summary = _.sortBy(result.summary, (i) => i.sum);
    var details = result.details;
    summary.map((item) => {
        const duration = moment.duration(item.sum, 'seconds');
        console.log(_.padEnd(item.author, 20), `${Math.floor(duration.asHours())}h ${_.padStart(duration.minutes(), 2, '0')}m`);

    });
    console.log('---');
    _.each(details, (items, author) => {
        console.log(author);
        _.each(_.sortBy(items, (i) => i.started ), (item) => {
            console.log('  ', `${item.started.format(config.reportDateFormat)} | ${ _.padStart(item.timeSpent, 6)} | ${item.issue.key} | ${_.padEnd(_.truncate(item.comment.replace(/(\n|\r)/g, '/ '), {length: 30}), 30)} | ${_.truncate(item.issue.fields.summary, {length: 20})} `);
        });
    });
}

module.exports = WriteConsoleReport;