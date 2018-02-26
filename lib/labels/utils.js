const _ = require('lodash');

module.exports = { collectTimeByLabels: (result) => {

    const labelsSummary = new Map();
    let totalTime = 0;
    const incTime = (label, time) => {
        labelsSummary.has(label)
            ? (labelsSummary.set(label, labelsSummary.get(label) + time))
            : labelsSummary.set(label, time);
    };

    _.forEach(result.details, (worklogs) => {
        worklogs.forEach(({issue, timeSpentSeconds:time}) => {
            totalTime += time;
            const labels = issue.fields.labels;
            labels.forEach(label => {
                incTime(label, time);
            });
            incTime(issue.fields.labels.sort().join('/'), time);
        });
    });

    return { labelsSummary, totalTime };

}};