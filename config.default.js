module.exports = {
    jira: {
        "protocol": "https",
        "host": "",
        "apiVersion": "2",
        "projectKey": "as",
        "maxIssueResults": 10000,
        "verbose": true,
        searchDateFormat: "YYYY/MM/DD"
    },
    cmdArgDateFormat: "YYYY/MM/DD HH:mm",
    reportDateFormat: "YY/MM/DD HH:mm",
    repFileNameDateFormat: "YY-MM-DD_HH-mm",
    startWorkingHour: 8,
    issueChunkSize: 256,
    issueChunkDelay: 1000,
    issueFetchAttemptCount: 5,
    reporters: [
        './lib/console-report-writter'
    ]
};
