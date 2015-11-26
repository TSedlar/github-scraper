# github-scraper
Scrapes the repositories you work on and stores info in a json file

![](https://img.shields.io/badge/License-GPLv2-blue.svg) ![](https://travis-ci.org/TSedlar/github-scraper.svg)

# Usage

```
babel-node ./src/index.js {user} {token} {user-agent} {json-file-to-write}
```

You will want to add a cron job that will run the scraper daily.
One can do so via crontab:

```
crontab -e
```

This will bring up vim/nano/etc and you can add in a task via:

```
@daily babel-node /path/to/github-scraper/src/index.js {user} {token} {user-agent} {json-file-to-write}
```

Obviously, you'll want to run the js file after you add in the cron task, otherwise you will not get your json file until midnight according to cron's @daily executor.
