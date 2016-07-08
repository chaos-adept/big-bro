'use strict';

const _ = require('lodash');
const moment = require('moment');
const config = require('./config-utils').loadConfig();
//todo extract template
function WriteStringReportToHandler(options, writer) {
    var result = options.result;
    var summary = _.sortBy(result.summary, (i) => i.sum);
    var details = result.details;
    writer(`
        <style type="text/css">
            TABLE {        
              background: #ffffff;   
              border: 0px ;        }       
             TD, TH {   
               font-family: monospace;
               font-size: 9pt;
               padding: 1px;         
               border: 1px solid #dddddd;        
             } 
     
           A:link { 
             color: black;
             text-decoration: none;
           } 
           A:visited { text-decoration: none; } 
           A:active { text-decoration: none; }
           A:hover {
            text-decoration: underline; 
            color: #2a37ff; 
           }   
   
           .text-small {
                font-size: xx-small;
           }
      </style>     
    `);
    writer(`<span class="text-small">${options.stereotype}:</span>`);
    writer(`<span class="text-small">
                ${options.dates.startDate.format('LLLL')}
                -
                ${options.dates.endDate.format('LLLL')}</span> <br/>`);
    writer('<table>');
    summary.map((item) => {
        const duration = moment.duration(item.sum, 'seconds');
        writer(`<tr><td>${item.author}</td><td>${Math.floor(duration.asHours())}h ${_.padStart(duration.minutes(), 2, '0')}m</td></tr>`);

    });
    writer('</table> <br/>');

    writer(`<table>`);
    summary.map((item) => {
        const author = item.author;
        const items = details[author];

        writer(`<tr><td colspan="5">${author}</td></tr>`);
        _.each(_.sortBy(items, (i) => i.started), (item) => {
            writer(`
                <tr>
                <td nowrap>${item.started.format(config.reportDateFormat)} </td> 
                <td nowrap> ${ (item.timeSpent)} </td> 
                <td nowrap> <a href="${config.jira.protocol}://${config.jira.host}/issues/${item.issue.key}"> ${item.issue.key} </a> </td> 
                <td nowrap>${_.truncate(item.comment, {length: 50})} </td> 
                <td nowrap>${_.truncate(item.issue.fields.summary, {length: 30})} </td>
                </tr>
                `);
        });
        writer(`<tr><td colspan="5"></td></tr>`);
    });
    writer('</table>');
}

function WriteHtmlReport(options) {
    var result = "";
    WriteStringReportToHandler(options, function () {
        var args = [].slice.call(arguments);
        result += " " + args.join(' ');
    });
    return result;
}

module.exports = WriteHtmlReport;