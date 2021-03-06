'use strict';

const moment = require('moment');
const _ = require('lodash');
const Promise = require('bluebird');
const JiraApi = require('chaos-adept-jira').JiraApi;
const utils = require('./utils');
const fetchUtils = require('./worklog-fetch-utils');
const repDf = ("HH:mm yy/MM/dd");
const log4js = require('log4js');
const logger = log4js.getLogger('fetch');
const buildFetchUpdateQuery = require("../lib/query-builder").buildFetchUpdateQuery;

function trimWorklogsByDates(worklogs, startDate, endDate) {
    return worklogs.filter( (worklogItem) => {
        var startedDate = moment(worklogItem.started);
        return ( startedDate.isBetween(startDate, endDate) ) } );
}

function trimWorklogsByAuthors(worklogs, authors = []) {
    if (!authors.length) {
        return worklogs;
    }

    return worklogs.filter( (_) => {
        return authors.includes(_.author.name)
    } );
}

function issueToWorklogPromise(maxFetchAttemptCount, getWorklogPromise, issue) {
    const getUndefinedRespChekerPromise = () => fetchUtils.promiseUndefinedChecker(getWorklogPromise(issue.key));
    return fetchUtils.repeatablePromise(getUndefinedRespChekerPromise, maxFetchAttemptCount);
}

function getWorkLogs(options) {
    const config = utils.loadConfig();
    var jiraOpts = config.jira;
    var chunkSize = config.issueChunkSize;
    var issueChunkDelay = config.issueChunkDelay;

    var jira = new JiraApi(
        jiraOpts.protocol, jiraOpts.host, jiraOpts.port,
        jiraOpts.userName, jiraOpts.password, jiraOpts.apiVersion, jiraOpts.verbose);
    const getWorkLogPromise = Promise.promisify(jira.getWorklog.bind(jira));
    const searchPromise = Promise.promisify(jira.searchJira.bind(jira));

    var srchStartDate = moment(options.startDate).format(jiraOpts.searchDateFormat);
    var srchEndDate = moment(options.endDate).format(jiraOpts.searchDateFormat);

    var searchOptions = {};

    searchOptions.maxResults = jiraOpts.maxIssueResults;
    const fields = [];
    fields.push('summary');
    fields.push('components');
    fields.push('labels');
    searchOptions.fields = fields;

    const query = buildFetchUpdateQuery(jiraOpts.projectKey, srchStartDate, srchEndDate);

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

            var getWorkLogChunk = issueChunk.map(
                issueToWorklogPromise.bind(this, config.issueFetchAttemptCount, getWorkLogPromise));
            const worklogsRespChunk = yield Promise.all(getWorkLogChunk);

            for (var worklogsRespIndx = 0; worklogsRespIndx < worklogsRespChunk.length; worklogsRespIndx++) {
                var worklogsResp = worklogsRespChunk[worklogsRespIndx];
                var issue = issueChunk[worklogsRespIndx];
                logger.debug(`${issue.key} resp: ${JSON.stringify(worklogsResp)}`);
                let worklogs = trimWorklogsByDates(worklogsResp.worklogs, options.startDate, options.endDate);
                worklogs = trimWorklogsByAuthors(worklogs, config.fromAuthors);

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
