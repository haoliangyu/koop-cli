const path = require('path')
const fs = require('fs-extra')
const exec = require('../utils/exec-realtime')

exports.options = (yargs) => {
  yargs
    .option('port', {
      alias: 'p',
      type: 'number',
      description: 'port number of the server'
    })
}

exports.handler = (argv = {}) => {
  const koopConfig = fs.readJsonSync(path.join(process.cwd(), 'koop.json'))

  if (koopConfig.type === 'provider') {
    serveProvider(argv.port)
  } else if (koopConfig.type === 'app') {
    serveApp(argv.port)
  }
}

function serveApp () {
  const packageInfo = fs.readJsonSync(path.join(process.cwd(), 'package.json'))
  const command = packageInfo.scripts.start
    ? 'npm run start'
    : `node ${packageInfo.main}`

  exec(command)
}

function serveProvider (port) {
  const packageInfo = fs.readJsonSync(path.join(process.cwd(), 'package.json'))

  if (packageInfo.scripts.start) {
    exec('npm run start')
  } else {
    const Koop = require('koop')
    const koop = new Koop()

    const provider = require(path.join(process.cwd(), packageInfo.main))
    koop.register(provider)
    koop.server.listen(port || 8080)
  }
}
