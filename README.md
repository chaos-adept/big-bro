usage

groovy incremental-report --jiraUrl "http://jira.wiley.ru" --user JIRA_USER --pwd JIRA_PWD --proj "AS" --ticketsFromDate "yyyy/MM/dd HH:mm" --ticketsToDate "yyyy/MM/dd HH:mm" --workLogFromDate "yyyy/MM/dd HH:mm" --workLogToDate "yyyy/MM/dd HH:mm"

note: first run could be slow because it takes JIRA dependencies from maven