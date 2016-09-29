const GitHub = require('./GitHub')
const Objects = require('small-node-collections').Objects

const fs = require('fs')

let hub = null
let jsonFile = null

let keys = [
  'name', 'description', 'updated_at', 'html_url', 'language',
  'stargazers_count', 'forks_count', 'contributor_count'
]

let handleGitHub = () => {
  hub.parseUserRepositories()
    .then(userJSON => {
      hub.parseOrganizationRepositories()
        .then(orgJSON => {
          let minimal = {}
          minimal['repositories'] = userJSON
          Objects.forEach(orgJSON, (key, value) => minimal[key] = value)
          console.log('Updating github.json')
          fs.writeFile(jsonFile, JSON.stringify(minimal, null, 2), (err) => {
            if (err) {
              console.log(err)
            }
          })
        }).catch((err) => console.log(err))
    }).catch((err) => console.log(err))
}

if (process.argv.length === 3) { // argv[2] == first arg
  let json = JSON.parse(fs.readFileSync(process.argv[2], 'UTF8'))
  hub = GitHub.fromJSON(json)
  jsonFile = json.target_file
  handleGitHub()
} else if (process.argv.length > 2) { // > 1 arg
  let user = process.argv[2]
  let token = process.argv[3]
  let userAgent = process.argv[4]
  jsonFile = process.argv[5]
  hub = new GitHub(user, token, userAgent, keys)
  handleGitHub()
}

module.exports = GitHub
