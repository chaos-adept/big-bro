//thanks to https://github.com/B-Stefan/node-jira-worklog-export
const moment = require('moment');
const Promise = require('bluebird');
const argvToRepDate = require('./lib/utils').argvToRepDate;
const argv = require('optimist').argv;
const _ = require('lodash');
const generateReport = require('./lib/generate-report');
var startDate, endDate;

function writeReport(dates) {
    generateReport(dates).then( (result) => {
        console.dir(result.summary);
        var details = _.flatten(_.map(result.details, (items, author) => (
                items.map( (item) => ({ author: author, comment: item.comment, issueKey: item.issue.key })) )));
        console.dir(details);
    });
}

if (argv.day) {
    startDate = argvToRepDate(argv.day);
    endDate = startDate.clone();
    endDate.add(1, 'd');
    writeReport({startDate, startDate});
} else if (argv.startDate && argv.endDate) {
    startDate = argvToRepDate(argv.startDate);
    endDate = argvToRepDate(argv.endDate);
    endDate.add(1, 'd');
    writeReport({startDate, endDate});
}

