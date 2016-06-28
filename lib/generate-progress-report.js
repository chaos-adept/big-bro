'use strict';

const moment = require('moment');
const _ = require('lodash');
const Promise = require('bluebird');
const JiraApi = require('jira').JiraApi;
const utils = require('./utils');
const repDf = ("HH:mm yy/MM/dd");
const log4js = require('log4js');
const logger = log4js.getLogger('fetch');

function getProgress(query) {
    var jiraOpts = utils.config.jira;

    var jira = new JiraApi(
        jiraOpts.protocol, jiraOpts.host, jiraOpts.port,
        jiraOpts.userName, jiraOpts.password, jiraOpts.apiVersion, jiraOpts.verbose);

    var searchOptions = {
        maxResults: jiraOpts.maxIssueResults,
        fields: ['timeoriginalestimate', 'timeestimate', 'timespent', 'summary']
    };


    //var query = `project = "${jiraOpts.projectKey}" and updatedDate >= "${srchStartDate}" order by updatedDate desc `;
    var searchPromise = Promise.promisify(jira.searchJira.bind(jira));

    logger.info('jira query: ' + query);

    var getResult = Promise.coroutine(function *() {
        var data = yield searchPromise(query, searchOptions);
        return data;
    });

    return getResult().then((result) => {
        const getEstimation = (it) => ( +(it.fields.timeoriginalestimate) || +(it.fields.timeestimate) || 0);
        const getSpent = (it) => ( +(it.fields.timespent ) || 0);
        const timeSpentSummary = _.reduce(result.issues, (sum, it) => {
            return sum + getSpent(it);
        }, 0);
        const timeEstimatedSummary = _.reduce(result.issues, (sum, it) => {
            return sum + getEstimation(it);
        }, 0);
        console.log('timespent summary', timeSpentSummary);
        console.log('timeEstimated summary', timeEstimatedSummary);
        console.log('progress ', (timeSpentSummary / timeEstimatedSummary).toFixed(2) * 100, '%');
        console.log(`validation failed for:`);
        let invalidCount = 0;
        result.issues.forEach(it => {
            if (getEstimation(it) <= getSpent(it)) {
                console.log(`${it.key} : ${it.fields.summary}`, getEstimation(it), getSpent(it));
                invalidCount++;
            }
        });

        console.log(`invalid ${invalidCount} or ${result.issues.length}`);
        return result;
    });

}

module.exports = getProgress;

