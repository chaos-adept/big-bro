import com.atlassian.jira.rest.client.api.JiraRestClient
import com.atlassian.jira.rest.client.api.JiraRestClientFactory
import com.atlassian.jira.rest.client.api.domain.BasicProject
import com.atlassian.jira.rest.client.internal.async.AsynchronousJiraRestClientFactory
@Grapes(@Grab(group = 'com.atlassian.jira', module = 'jira-rest-java-client-core', version = '2.0.0-m30'))
@Grapes(@Grab(group = 'com.atlassian.jira', module = 'jira-rest-java-client-api', version = '2.0.0-m30'))

// These fields were generated using the login credentials

def cli = new CliBuilder(usage:'')
cli.jiraUrl(args:1, argName:'jiraUrl', 'jira url')
cli.user(args:1, argName:'user', 'use name')
cli.pwd(args:1, argName:'pwd', 'password')
cli.proj(args:1, argName:'proj', 'project name')
cli.days(args:1, argName:'days', 'how much days ago')

def options = cli.parse(args)

assert options
assert options.jiraUrl && options.user && options.pwd && options.proj && options.days

def URL = options.jiraUrl
def USERNAME = options.user
def PASSWORD = options.pwd
def PROJ = options.proj
def daysAgo = (options.days).toInteger()

// Connect to JIRA
final jiraRestClientFactory = new AsynchronousJiraRestClientFactory();
JiraRestClient jiraRestClient = jiraRestClientFactory
        .createWithBasicHttpAuthentication(URI.create(URL), USERNAME, PASSWORD);


// List Projects


Set<String> fields = ["worklog", "summary", "issuetype", "created", "updated", "project", "status"].toSet()
result = jiraRestClient.searchClient.searchJql("project = \"$PROJ\" AND updatedDate  >= startOfDay(-${daysAgo}d)", 100, 0, fields).get()
def cal = Calendar.getInstance()
cal.add(Calendar.DATE, -daysAgo)
startTime = cal.getTime()

userWorkLog = [:]
result.getIssues().findAll({ it.worklogs.size() > 0 }).each { issue ->
    issue.worklogs.each {
        if (it.startDate.toDate() >= startTime) {
            def userItems = userWorkLog.get(it.author.displayName, [])
            userItems.add it;
            println "$issue.key \t ${(it.minutesSpent / 60).toFloat().round(2)} \t $it.author.displayName  \t $issue.summary  \t $it.startDate"
        }
    }
}

//summary of time of the last day
println "work logs summary"
userWorkLog.each {
    println "$it.key \t ${(it.value*.minutesSpent.sum()/60).toFloat().round(2)}"
}

// Close connection

jiraRestClient.close();
