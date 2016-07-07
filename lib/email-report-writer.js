const assert = require('assert');

function writeToEmail(options) {
    const subject = `Jira-Report: ${options.dates.startDate.format('LLLL')} - ${options.dates.endDate.format('LLLL')}`;
    const reportText = require('./string-report-writer')(options);
    const reportHtml = require('./html-report-writer')(options);

    const config = require('./config-utils').loadConfig();
    const emailConfig = config['email-report-writer'];
    assert(emailConfig.smpt);
    assert(emailConfig.message);
    assert(emailConfig.message.to);
    assert(emailConfig.message.from);

    const email = require("./../node_modules/emailjs/email");
    const server = email.server.connect(emailConfig.smpt);

    var message = {
        text: reportText,
        from: emailConfig.message.from,
        to: emailConfig.message.to,
        cc: emailConfig.message.cc,
        subject: subject,
        attachment: [
            {data: `<html> <div>${reportHtml}<div> </html>`, alternative: true}
        ]
    };
    server.send(message, function (err) {
        if (err) throw err;
    });
}

module.exports = writeToEmail;