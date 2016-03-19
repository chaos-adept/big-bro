//thanks to https://github.com/B-Stefan/node-jira-worklog-export

var _ = require('lodash');
var Promise = require('bluebird');
var JiraApi = require('jira').JiraApi;

var defaultConfigName = './config.default.js';
var localConfigName = './config.local.js';

var defaultConfig = require(defaultConfigName);

var localConfig;
try {
    var moduleConfig = require(localConfigName);
    localConfig = _.extend(defaultConfig, moduleConfig);
} catch(e) {
    console.error(`${localConfigName} is not found, please create it with custom parameters from ${defaultConfigName}`);
    process.exit(e.code);
}

var options = localConfig;

var jira = new JiraApi(
        options.protocol, options.host, options.port,
        options.userName, options.password, options.apiVersion, options.verbose);

var searchOptions = {
    maxResults: options.maxIssueResults
};

var query = `project = "${options.projectKey}" order by updatedDate desc`;

var getWorkLogPromise = Promise.promisify(jira.getWorklog.bind(jira));

jira.searchJira(query, searchOptions, function (err, data) {
    if (err) {
        throw err;
    }

    var workLogPromises = data.issues.map( (issue) => {
        var workLogPromise = getWorkLogPromise(issue.key);
        return workLogPromise.then((worklogsResp) => {
            return {
                key: issue.key, summary: issue.fields.summary,
                item: issue, worklogs: JSON.stringify(worklogsResp.worklogs)
            }
        })
    });

    Promise.all(workLogPromises).then((results) => console.dir(results))

});
