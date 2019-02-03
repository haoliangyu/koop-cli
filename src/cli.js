#!/usr/bin/env node

process.env.SUPPRESS_NO_CONFIG_WARNING = true

const yargs = require('yargs')
const commands = require('./commands')
const parseConfig = require('./utils/parse-config')

module.exports = yargs
  .command(
    'new [type] [name]',
    'create a new koop project',
    commands.new.options,
    commands.new.handler
  )
  .command(
    'add [type] [name]',
    'add a new plugin to the current app',
    commands.add.options,
    commands.add.handler
  )
  .command(
    'test',
    'run tests in the current project',
    commands.test.options,
    commands.test.handler
  )
  .command(
    'serve',
    'run a koop server for the current project',
    commands.serve.options,
    commands.serve.handler
  )
  .option('quiet', {
    description: 'supress all console messages except errors',
    type: 'boolean',
    default: false
  })
  .middleware([parseConfig])
  .demandCommand()
  .showHelpOnFail(true)
  .help('help')
  .argv
