import * as _ from 'lodash';

const util = require('util');
const request = require('request');

const GITHUB_API = 'https://api.github.com/';
const GITHUB_USER_API = (GITHUB_API + 'users/');
const GITHUB_SEARCH_API = (GITHUB_API + 'search/');
const GITHUB_ISSUES_API = (GITHUB_SEARCH_API + 'issues');

const GITHUB_ISSUES_QUERY = (GITHUB_ISSUES_API + '?q=type:pr+state:closed+author:%s&per_page=1000&page=1');

let normalizeDate = (date) => {
  let dateSplit = date.split('T')[0].split('-');
  let month = dateSplit[1];
  let day = dateSplit[2];
  let year = dateSplit[0];
  return (month + '/' + day + '/' + year);
};

let fixTimes = (repo) => {
  repo.created_at = normalizeDate(repo.created_at);
  repo.updated_at = normalizeDate(repo.updated_at);
  repo.pushed_at = normalizeDate(repo.pushed_at);
};

class GitHub {

  constructor(user, token, userAgent) {
    this.user = user;
    this.token = token;
    this.userAgent = userAgent;
  }

  parseUserRepositories() {
    return new Promise((resolve, reject) => {
      let tokenItem = ('access_token=' + this.token);
      let url = (GITHUB_USER_API + this.user + '/repos?' + tokenItem);
      request({ url: url, headers: { 'User-Agent': this.userAgent } }, (err, res, body) => {
        if (err) {
          reject(err);
        }
        let json = JSON.parse(body);
        let promises = [];
        _.each(json, (repo) => {
          fixTimes(repo);
          let contribURL = repo['contributors_url'] + '?' + tokenItem;
          promises.push(new Promise((resolve, reject) => {
            request({ url: contribURL, headers: { 'User-Agent': this.userAgent }}, (err, res, body) => {
              if (err) {
                reject(err);
              }
              let contributors = JSON.parse(body);
              repo.contributor_count = contributors.length;
              resolve(repo);
            });
          }));
        });
        resolve(Promise.all(promises));
      });
    });
  }

  parseContributedRepositories() {
    return new Promise((resolve, reject) => {
      reject('Parsing contributed repositories is not implemented');
    })
  }
}

export {
  GitHub
};
