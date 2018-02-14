/**
 * Created by drykovanov on 01.02.2017.
 */
const _ = require('lodash');

module.exports.buildFetchUpdateQuery = (projectKey, startDate, endDate) => {
    if (_.isArray(projectKey)) {
        return `project in ("${projectKey.join('", "')}") and worklogDate >= "${startDate}" and worklogDate <= "${endDate}" `;
    } else {
        return `project = "${projectKey}" and worklogDate >= "${startDate}" and worklogDate <= "${endDate}`;
    }
};

