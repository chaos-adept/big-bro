import com.atlassian.jira.rest.client.api.JiraRestClient
import com.atlassian.jira.rest.client.api.JiraRestClientFactory
import com.atlassian.jira.rest.client.api.domain.BasicProject
import com.atlassian.jira.rest.client.internal.async.AsynchronousJiraRestClientFactory

import java.text.DateFormat
import java.text.SimpleDateFormat

@Grapes(@Grab(group = 'com.atlassian.jira', module = 'jira-rest-java-client-core', version = '2.0.0-m30'))
@Grapes(@Grab(group = 'com.atlassian.jira', module = 'jira-rest-java-client-api', version = '2.0.0-m30'))

// These fields were generated using the login credentials


def df = new SimpleDateFormat("yyyy/MM/dd HH:mm");

def cli = new CliBuilder(usage:'')
cli.jiraUrl(args:1, argName:'jiraUrl', 'jira url')
cli.user(args:1, argName:'user', 'use name')
cli.pwd(args:1, argName:'pwd', 'password')
cli.proj(args:1, argName:'proj', 'project name')
cli.fromDate(args:1, argName:'fromDate', 'from date')
cli.toDate(args:1, argName:'toDate', 'to date')

def options = cli.parse(args)

assert options
assert options.jiraUrl && options.user && options.pwd && options.proj && options.fromDate

def URL = options.jiraUrl
def USERNAME = options.user
def PASSWORD = options.pwd
def PROJ = options.proj
def fromDate = options.fromDate
def toDate = options.toDate

def fromDateAsDate = df.parse(fromDate);
def toDateAsDate = df.parse(toDate);

// Connect to JIRA
final jiraRestClientFactory = new AsynchronousJiraRestClientFactory();
JiraRestClient jiraRestClient = jiraRestClientFactory
        .createWithBasicHttpAuthentication(URI.create(URL), USERNAME, PASSWORD);


// List Projects


Set<String> fields = ["worklog", "summary", "issuetype", "created", "updated", "project", "status"].toSet()
def jql = "project = \"$PROJ\" AND updatedDate  >= \"$fromDate\"  AND updatedDate <= \"$toDate\" order by updatedDate DESC";
println jql
result = jiraRestClient.searchClient.searchJql(jql, 500, 0, fields).get()

userWorkLog = [:]
result.getIssues().findAll({ it.worklogs.size() > 0 }).sort { it.updateDate.toDate() } .reverse(true) .each { issue ->
    issue.worklogs.each {
        if ((it.startDate.toDate() >= fromDateAsDate) && (it.startDate.toDate() <= toDateAsDate )) {
            def userItems = userWorkLog.get(it.author.displayName, [])
            def item = [issue:issue, worklog: it];
            userItems.add(item);
            println "$issue.key \t ${(it.minutesSpent / 60).toFloat().round(2)} \t $it.author.displayName  \t $issue.summary \t ${it.comment ?: '<NO-COMMENT>'}  \t ${df.format(it.startDate.toDate())}"
        }
    }
}

//summary of time of the last day
println "work logs summary"
userWorkLog.each {
    println "$it.key \t ${(it.value*.worklog*.minutesSpent.sum()/60).toFloat().round(2)}"
}

println("Work Logs Per-User")
userWorkLog.each {
    def items = it.value
    println "--- $it.key ---"
    items.sort { it.worklog.startDate.toDate() }.each { item ->
        def issue = item.issue
        def worklog = item.worklog
        println "$it.key \t ${issue.key} \t ${issue.summary} \t ${((worklog.minutesSpent / 60).toFloat().round(2))} \t ${worklog.comment ?: '<NO-COMMENT>'}"
    }

}

// Close connection

jiraRestClient.close();
