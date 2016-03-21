const _ = require('lodash');
const excelBuilder = require('msexcel-builder');
const config = require('./utils').config;

function writeExcelReport(fileName, result) {
    var workbook = excelBuilder.createWorkbook('./', fileName + '.xlsx');

    // Create a new worksheet with 10 columns and 12 rows
    var summarySheet = workbook.createSheet('Summary', 100, 300);
    // Fill some data
    var rowIndx = 1;
    var colIndx = 1;


    summarySheet.set(colIndx++, rowIndx, 'Author');
    summarySheet.set(colIndx++, rowIndx, 'Summary');
    rowIndx++;
    summarySheet.width(1, 20);

    _.map(result.summary, (summaryItem) => {
        colIndx = 1;
        summarySheet.set(colIndx++, rowIndx, summaryItem.author);
        summarySheet.set(colIndx++, rowIndx, summaryItem.sum);
        rowIndx++;
    });

    var detailsSheet = workbook.createSheet('Details', 100, 300);
    detailsSheet.width(1, 20);
    detailsSheet.width(2, 20);
    detailsSheet.width(4, 40);
    detailsSheet.width(5, 40);
    rowIndx = 1;
    colIndx = 1;
    detailsSheet.set(colIndx++, rowIndx, 'Author');
    detailsSheet.set(colIndx++, rowIndx, 'Started');
    detailsSheet.set(colIndx++, rowIndx, 'Time');
    detailsSheet.set(colIndx++, rowIndx, 'Summary');
    detailsSheet.set(colIndx++, rowIndx, 'Comment');
    detailsSheet.set(colIndx++, rowIndx, 'IssueKey');
    rowIndx++;
    _.forEach(result.details, (items, author) => {
        _.forEach(_.sortBy(items, ['started']), (item) => {
            colIndx = 1;
            detailsSheet.set(colIndx++, rowIndx, author);
            detailsSheet.set(colIndx++, rowIndx, item.started.format(config.reportDateFormat));
            detailsSheet.set(colIndx++, rowIndx, item.timeSpent);
            detailsSheet.set(colIndx++, rowIndx, item.issue.fields.summary);
            detailsSheet.set(colIndx++, rowIndx, item.comment);
            detailsSheet.set(colIndx++, rowIndx, item.issue.key);
            rowIndx++;
        });
    });


    workbook.save(function (err) {
        if (err) {
            workbook.cancel();
            throw err;
        }
        else {
            console.log("Worklog saved to " + fileName + ".xlsx");
        }
    });
}


module.exports = {
    writeExcelReport: writeExcelReport
};