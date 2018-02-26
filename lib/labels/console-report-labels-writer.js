const _ = require('lodash');
const { toHours } = require('../utils');
const { collectTimeByLabels } = require('./utils');

function WriteConsoleReport({result}) {

    const { labelsSummary, totalTime } = collectTimeByLabels(result);

    console.log(`time total: ${toHours(totalTime).toFixed(2)}h`);
    for (const [key, value] of (Array.from(labelsSummary.entries()).sort())) {
        console.log(`${key}  = ${toHours(value).toFixed(2)}h - ${Math.trunc(value/totalTime * 100).toFixed(2)}%`);
    }
}

module.exports = WriteConsoleReport;
