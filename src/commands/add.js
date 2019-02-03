const addPlugin = require('../utils/add-plugin')

exports.options = (yargs) => {
  yargs
    .positional('type', {
      description: 'plugin type',
      type: 'string',
      choices: ['output', 'provider', 'cache', 'auth']
    })
    .positional('name', {
      description: 'plugin name',
      type: 'string'
    })
    .option('route-prefix', {
      description: 'add a prefix to all of a registered provider’s routes',
      type: 'string',
      group: 'Provider Options:'
    })
    .option('config', {
      description: 'specify the plugin configuration in JSON',
      type: 'string'
    })
    .option('add-to-root', {
      description: 'add the given configuration to the app root configuration',
      type: 'boolean',
      default: false
    })
}

exports.handler = async (argv) => {
  const name = argv.name
  const type = argv.type
  const cwd = process.cwd()

  return addPlugin(cwd, type, name, argv)
}
