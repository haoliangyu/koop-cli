const path = require('path')
const fs = require('fs-extra')
const writeJson = require('./write-formatted-json')

module.exports = async (cwd, type, name, newConfig = {}) => {
  const configPath = path.join(cwd, 'config/default.json')

  let config = {}

  if (await fs.pathExists(configPath)) {
    config = await fs.readJson(configPath)
  }

  if (type === 'app') {
    // add the configuration into the root level if it is an app project
    config = Object.assign(config, newConfig)
  } else {
    // otherwise, add the configuration into the plugin namespace
    if (!config[name]) {
      config[name] = {}
    }

    config[name] = Object.assign(config[name], newConfig)
  }

  return writeJson(configPath, config)
}
