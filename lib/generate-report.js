//thanks to https://github.com/B-Stefan/node-jira-worklog-export
const _ = require('lodash');
const getWorklogsPromise = require('./worklog-fetch');


function generateReport(dates) {
    return getWorklogsPromise(dates).then((results) => {
        var groupedByAuthor = _.groupBy(results, (item) => item.author.displayName || item.author.name);
        var summaryByAuthor = _.map(groupedByAuthor, ( (worklogs, key) => {
            return {author: key, sum: _.sumBy(worklogs, (item) => (+item.timeSpentSeconds / 60 / 60)).toFixed(2)}
        }));
        return {
            summary: summaryByAuthor,
            details: groupedByAuthor
        }
    });
}

module.exports = generateReport;