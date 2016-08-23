# github-scraper
Scrapes the repositories you work on and stores info in a json file

![](https://img.shields.io/badge/License-MIT-blue.svg)
![](https://travis-ci.org/TSedlar/github-scraper.svg)
[![](https://badge.fury.io/js/github-scraper-js.svg)](https://www.npmjs.com/package/github-scraper-js)
![](https://david-dm.org/TSedlar/github-scraper.svg)

## Code Style

This library adheres to the [StandardJS code style]((https://github.com/feross/standard)).

[![](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard)


# Config file

```
{
  "user": "...",
  "token": "...", 
  "user_agent": "...", 
  "wanted_keys": [
    "name", "description", "updated_at", "html_url", "language",
    "stargazers_count", "forks_count", "contributor_count"
  ],
  "target_file": "./target.json"
}
```

# Usage

```
node ./lib/index.js {user} {token} {user-agent} {json-file-to-write}
```

or 

```
node ./lib/index.js {json-config}
```

This can be used via a crontab or forever/pm2.
