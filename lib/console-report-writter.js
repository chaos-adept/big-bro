const _ = require('lodash');
const config = require('./config-utils');

function WriteConsoleReport(options) {
    var result = options.result;
    result.summary.map((item) => console.log(_.padEnd(item.author, 20), _.padEnd(item.sum, 3)) );
    console.log('---');
    _.each(result.details, (items, author) => {
        console.log(author);
        _.each(_.sortBy(items, (i) => i.started ), (item) => {
            console.log('  ', `${item.started.format(config.reportDateFormat)} | ${ _.padStart(item.timeSpent, 10)} | ${item.issue.key} | ${_.padEnd(_.truncate(item.comment.replace(/\n/g, ' '), {length: 20}), 20)} | ${_.truncate(item.issue.fields.summary, {length: 20})} `);
        });
    });
}

module.exports = WriteConsoleReport;