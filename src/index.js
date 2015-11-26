import { GitHub } from './GitHub';

const fs = require('fs');

let user = process.argv[2];
let token = process.argv[3];
let userAgent = process.argv[4];
let jsonFile = process.argv[5];

let hub = new GitHub(user, token, userAgent);

hub.parseUserRepositories()
  .then((userJSON) => {
    console.log('Updating github.json');
    fs.writeFile(jsonFile, JSON.stringify(userJSON, null, 2), (err) => {
      if (err) {
        console.log(err);
      }
    });
  }).catch((err) => console.log(err));