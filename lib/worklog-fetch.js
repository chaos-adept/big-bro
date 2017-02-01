'use strict';

const moment = require('moment');
const _ = require('lodash');
const Promise = require('bluebird');
const JiraApi = require('chaos-adept-jira').JiraApi;
const utils = require('./utils');
const repDf = ("HH:mm yy/MM/dd");
const log4js = require('log4js');
const logger = log4js.getLogger('fetch');
const buildFetchUpdateQuery = require("../lib/query-builder").buildFetchUpdateQuery;

function trimWorklogsByDates(worklogs, startDate, endDate) {
    return worklogs.filter( (worklogItem) => {
        var startedDate = moment(worklogItem.started);
        return ( startedDate.isBetween(startDate, endDate) ) } );
}

function getWorkLogs(options) {
    const config = utils.loadConfig();
    var jiraOpts = config.jira;
    var chunkSize = config.issueChunkSize;
    var issueChunkDelay = config.issueChunkDelay;

    var jira = new JiraApi(
        jiraOpts.protocol, jiraOpts.host, jiraOpts.port,
        jiraOpts.userName, jiraOpts.password, jiraOpts.apiVersion, jiraOpts.verbose);

    var srchStartDate = moment(options.startDate).format(jiraOpts.searchDateFormat);
    var srchEndDate = moment(options.endDate).format(jiraOpts.searchDateFormat);

    var searchOptions = {
        maxResults: jiraOpts.maxIssueResults
    };

    const query = buildFetchUpdateQuery(jiraOpts.projectKey, srchStartDate);
    var getWorkLogPromise = Promise.promisify(jira.getWorklog.bind(jira));

    var searchPromise = Promise.promisify(jira.searchJira.bind(jira));

    logger.info('jira query: ' + query);

    var getResult = Promise.coroutine(function * () {
        var data = yield searchPromise(query, searchOptions);

        if ( data.total > jiraOpts.maxIssueResults ) {
            throw new Error(`jira found more issues ${data.total} than you specified in max results ${data.maxIssueResults}`);
        }

        var allWorkLogs = [];
        var indx = 0;
        var issuesChunks = _.chunk(data.issues, chunkSize);
        for (let issueChunk of issuesChunks) {
            //logger.debug(`processing chunk ${issueChunk.map((issue) => issue.key)}`);
            indx += issueChunk.length;

            var getWorkLogChunk = issueChunk.map( (issue) => getWorkLogPromise(issue.key) );
            const worklogsRespChunk = yield Promise.all(getWorkLogChunk);

            for (var worklogsRespIndx = 0; worklogsRespIndx < worklogsRespChunk.length; worklogsRespIndx++) {
                var worklogsResp = worklogsRespChunk[worklogsRespIndx];
                var issue = issueChunk[worklogsRespIndx];
                logger.debug(`${issue.key} resp: ${JSON.stringify(worklogsResp)}`);
                var worklogs = trimWorklogsByDates(worklogsResp.worklogs, options.startDate, options.endDate);

                //logger.debug(` ${issue.key} - all worklogs ${worklogsResp.worklogs.map( (log) => ( `${log.started} ${log.timeSpent}` )) }`);
                //logger.debug(` ${issue.key} - filtered worklogs ${worklogs.map( (log) => ( `${log.started} ${log.timeSpent}` )) }`);


                worklogs.forEach((item) => {
                    item.issue = issue;
                    item.started = moment(item.started);
                    item.created = moment(item.created);
                });
                allWorkLogs = allWorkLogs.concat(worklogs);
            }

            if (issuesChunks.length > 1) {
                logger.info(`processed ${indx} / ${data.total}`);
                yield Promise.delay(issueChunkDelay);
            }
        }

        return allWorkLogs;
    });

    var result = getResult();
    return result;
}

module.exports = getWorkLogs;