import { GitHub } from './GitHub';
import * as _ from 'lodash';

const fs = require('fs');

let hub = null;
let jsonFile = null;

let keys = [
  'name', 'description', 'updated_at', 'language', 
  'stargazers_count', 'forks_count', 'contributor_count'
];

if (process.argv.length > 2) {
  let user = process.argv[2];
  let token = process.argv[3];
  let userAgent = process.argv[4];
  jsonFile = process.argv[5];
  hub = new GitHub(user, token, userAgent, keys);
}

hub.parseUserRepositories()
  .then((userJSON) => {
    hub.parseOrganizationRepositories()
      .then((orgJSON) => {
        let minimal = {};
        minimal['repositories'] = userJSON;
        _.each(orgJSON, (value, key) => {
          minimal[key] = value;
        });
        console.log('Updating github.json');
        fs.writeFile(jsonFile, JSON.stringify(minimal, null, 2), (err) => {
          if (err) {
            console.log(err);
          }
        });
      }).catch((err) => console.log(err));
  }).catch((err) => console.log(err));
