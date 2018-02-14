const _ = require('lodash');
const { toHours } = require('./utils');

function WriteConsoleReport({result}) {
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

    console.log(`time total: ${toHours(totalTime).toFixed(2)}h`);
    for (const [key, value] of (Array.from(labelsSummary.entries()).sort())) {
        console.log(`${key}  = ${toHours(value).toFixed(2)}h - ${Math.trunc(value/totalTime * 100).toFixed(2)}%`);
    }
}

module.exports = WriteConsoleReport;
