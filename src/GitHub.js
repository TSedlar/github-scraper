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

class GitHub {

  constructor(user, token, userAgent, wantedKeys) {
    this.user = user;
    this.token = token;
    this.userAgent = userAgent;
    this.wantedKeys = wantedKeys
  }

  parseContributorCount(contribURL, userAgent) {
    return new Promise((resolve, reject) => {
      request({ url: contribURL, headers: { 'User-Agent': userAgent }}, (err, res, body) => {
        if (err) {
          reject(err);
        }
        let contributors = JSON.parse(body);
        resolve(contributors.length);
      });
    });
  }

  resolveRepositories(resolver, rejector, tokenItem, body) {
    return new Promise((resolve, reject) => {
      let promiseList = [];
      let json = JSON.parse(body);
      _.each(json, (repo) => {
        let promises = [];
        _.each(this.wantedKeys, (key) => {
          promises.push(new Promise((res, rej) => {
            let value = repo[key];
            if (key === 'contributor_count') {
              let contribURL = repo['contributors_url'] + '?' + tokenItem;
              this.parseContributorCount(contribURL, this.userAgent).then((count) => {
                res({ key: key, value: count });
              });
            } else if (key === 'updated_at' || key === 'updated_at' || key === 'pushed_at') {
              res({ key: key, value: normalizeDate(value) });
            } else {
              res({ key: key, value: value });
            }
          }));
        });
        promiseList.push(promises);
      });
      let iter = [];
      _.each(promiseList, (promises) => {
        iter.push(new Promise((res, rej) => {
          res(Promise.all(promises));
        }));
      });
      resolve(Promise.all(iter).then((results) => {
        let minimal = [];
        _.each(results, (result) => {
          let repo = {};
          _.each(result, (mapping) => {
            repo[mapping.key] = mapping.value;
          });
          minimal.push(repo);
        });
        resolver(minimal);
      }).catch((err) => rejector(err)));
    });
  }

  parseRepositories(user) {
    return new Promise((resolve, reject) => {
      let tokenItem = ('access_token=' + this.token);
      let url = (GITHUB_USER_API + user + '/repos?' + tokenItem);
      request({ url: url, headers: { 'User-Agent': this.userAgent } }, (err, res, body) => {
        if (err) {
          reject(err);
        }
        this.resolveRepositories(resolve, reject, tokenItem, body);
      });
    });
  }

  parseUserRepositories() {
    return this.parseRepositories(this.user);
  }

  parseOrganizationRepositories() {
    return new Promise((resolve, reject) => {
      let tokenItem = ('access_token=' + this.token);
      let url = (GITHUB_USER_API + this.user + '/orgs?' + tokenItem);
      request({ url: url, headers: { 'User-Agent': this.userAgent }}, (err, res, body) => {
        if (err) {
          reject(err);
        }
        let json = JSON.parse(body);
        let promises = [];
        _.each(json, (organization) => {
          promises.push(new Promise((res, rej) => {
            this.parseRepositories(organization.login)
              .then((result) => {
                res({ key: organization.login, value: result });
              }).catch((err) => rej(err));
          }));
        });
        Promise.all(promises)
          .then((result) => {
            let results = {};
            _.each(result, (mapping) => {
              results[mapping.key] = mapping.value;
            });
            resolve(results);
          }).catch((err) => reject(err));
      })
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
