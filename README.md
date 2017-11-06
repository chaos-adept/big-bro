Big Brother
=================
a tool for generation time reports by fetching jira workLog items over rest.

project name recall to [Big Brother (Nineteen Eighty-Four)](https://en.wikipedia.org/wiki/Big_Brother_%28Nineteen_Eighty-Four%29)

![big bro](https://upload.wikimedia.org/wikipedia/en/f/fe/Telescreen.png)


# install
* install nodejs from [nodejs official site](https://nodejs.org/en/)

tool based way (recommended)
* run `npm i`
* run `npm run setup:local-config -- --user=<user> --password=<password>`

  sample `npm run setup:local-config -- --user=avaserman --password=verysecreetpasswordhere123`

manual way
* run `npm i`
* copy `config.local.sample.js` to `config.local.js`
* edit jira user account in `config.local.js`

`config.local.sample.js`
```
module.exports = {
    jira: {
        "userName": "ENTER JIRA USER",
        "password": "ENTER JIRA PASSWORD"
    }
};
```

to something like these

`config.local.js`
```
module.exports = {
    jira: {
        "userName": "avaserman",
        "password": "verysecreetpasswordhere123"
    }
};
```


# report generation

## today
    npm run generate:today

## this week
    npm run generate:week

## yesterday
    npm run generate:yesterday

## previous week
    npm run generate:previous-week

## day

    npm run generate:day <YYYY/MM/DD>


## period

    npm run start --cmd=period --startDate=<YYYY/MM/DD> --endDate=<YYYY/MM/DD>

## progress based on estimations and spent time

    npm run progress:query -- "--query=<jql>"
sample `npm run progress:query -- "--query=project = 'as' AND component = 'admin ui' and statusCategory != Done"`