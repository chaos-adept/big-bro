const _ = require('lodash');
const { toHours } = require('../utils');
const { collectTimeByLabels } = require('./utils');

function WriteConsoleReport({result}) {

    const { labelsSummary, totalTime } = collectTimeByLabels(result);

    console.log(`time total: ${toHours(totalTime).toFixed(2)}h`);
    const keys = [];
    const values = [];
    for (const [key, value] of (Array.from(labelsSummary.entries()).sort())) {
        keys.push(key);
        values.push(toHours(value).toFixed(2));
    }

    const mappedKeys = (keys.map(_ => (_ &&`"${_}"`) || '"nolabel"').join(', '));
    const mappedValues = (values.map(_ => `"${_}"`).join(', '));

    fs = require('fs');
    fs.writeFile('labels.csv', mappedKeys + "\n" + mappedValues, function (err) {
        if (err) {
            throw (err);
        }
    });
}

module.exports = WriteConsoleReport;
