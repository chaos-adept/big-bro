/**
 * Created by drykovanov on 01.02.2017.
 */
const _ = require('lodash');

module.exports.buildFetchUpdateQuery = (projectKey, startDate) => {
    if (_.isArray(projectKey)) {
        return `project in ("${projectKey.join('", "')}") and updatedDate >= "${startDate}" order by updatedDate desc `;
    } else {
        return `project = "${projectKey}" and updatedDate >= "${startDate}" order by updatedDate desc `;
    }
};

