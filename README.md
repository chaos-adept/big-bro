Big Brother
=================
for more information about project name refer to [Big Brother (Nineteen Eighty-Four)](https://en.wikipedia.org/wiki/Big_Brother_%28Nineteen_Eighty-Four%29)

![big bro](https://upload.wikimedia.org/wikipedia/en/f/fe/Telescreen.png)


# install
* install nodejs from [nodejs official site](https://nodejs.org/en/)
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


# usage

## generate for today
    npm run generate:today

## generate for this week
    npm run generate:week

## generate for this yesterday
    npm run generate:yesterday

## generate for this previous week
    npm run generate:previous-week
