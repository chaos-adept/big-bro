module.exports = {
    jira: {
        "protocol": "https",
        "host": "jira.wiley.ru",
        "apiVersion": "2",
        "projectKey": "as",
        "maxIssueResults": 10000,
        "verbose": true,
        searchDateFormat: "YYYY/MM/DD HH:mm"
    },
    cmdArgDateFormat: "YYYY/MM/DD HH:mm",
    reportDateFormat: "YY/MM/DD HH:mm",
    repFileNameDateFormat: "YY-MM-DD_HH-mm",
    startWorkingHour: 8,
    issueChunkSize: 256,
    issueChunkDelay: 1000,
    reporters: [
        './lib/excel-report-writter',
        './lib/console-report-writter'
    ]
};