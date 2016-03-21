const moment = require('moment');
const _ = require('lodash');
const Promise = require('bluebird');
const JiraApi = require('jira').JiraApi;
const utils = require('./utils');
const repDf = ("HH:mm yy/MM/dd");

function trimWorklogsByDates(worklogs, startDate, endDate) {
    return worklogs.filter( (worklogItem) => {
        var startedDate = moment(worklogItem.started);
        return ( startedDate.isBetween(startDate, endDate) ) } );
}

function getWorkLogs(options) {
    var jiraOpts = utils.config.jira;

    var jira = new JiraApi(
        jiraOpts.protocol, jiraOpts.host, jiraOpts.port,
        jiraOpts.userName, jiraOpts.password, jiraOpts.apiVersion, jiraOpts.verbose);

    var srchStartDate = moment(options.startDate).format(jiraOpts.searchDateFormat);
    var srchEndDate = moment(options.endDate).format(jiraOpts.searchDateFormat);

    var searchOptions = {
        maxResults: jiraOpts.maxIssueResults
    };

    var query = `project = "${jiraOpts.projectKey}" and updatedDate >= "${srchStartDate}" order by updatedDate desc `;
    var getWorkLogPromise = Promise.promisify(jira.getWorklog.bind(jira));
    var searchPromise = Promise.promisify(jira.searchJira.bind(jira));

    console.log('jira query: ', query);

    return searchPromise(query, searchOptions).then(function (data) {
        if ( data.total > jiraOpts.maxIssueResults ) {
            console.warn(`jira found more issues ${data.total} than you specified in max results ${data.maxIssueResults}`)
        }

        var workLogPromises = data.issues.map( (issue) => {
            var workLogPromise = getWorkLogPromise(issue.key);
            return workLogPromise.then((worklogsResp) => {
                var worklogs = trimWorklogsByDates(worklogsResp.worklogs, options.startDate, options.endDate);
                worklogs.forEach((item) => {
                    item.issue = issue;
                    item.started = moment(item.started);
                });
                return worklogs;
            })
        });

        return Promise.all(workLogPromises).then( (results) => _.flatten(results) );
    });
}

module.exports = getWorkLogs;