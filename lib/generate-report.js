//thanks to https://github.com/B-Stefan/node-jira-worklog-export
const _ = require('lodash');
const getWorklogsPromise = require('./worklog-fetch');
const utils = require('./utils');
const json2csv = require('json2csv');


function generateReport(dates) {
    return getWorklogsPromise(dates).then((results) => {
        var groupedByAuthor = _.groupBy(results, (item) => item.author.displayName);
        var summaryByAuthor = _.map(groupedByAuthor, ( (worklogs, key) => {
            return {key: key, sum: _.sumBy(worklogs, (item) => (+item.timeSpentSeconds / 60 / 60)).toPrecision(2)}
        }));
        return {
            summary: summaryByAuthor,
            details: groupedByAuthor
        }
    });
}

module.exports = generateReport;