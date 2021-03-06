/* eslint-env mocha */

const os = require('os')
const path = require('path')
const chai = require('chai')
const fs = require('fs-extra')
const createNewProject = require('../../../src/utils/create-new-project')
const Logger = require('../../../src/utils/logger')

const modulePath = '../../../src/utils/add-plugin'

const expect = chai.expect
const temp = os.tmpdir()

const defaultOptions = {
  skipGit: true,
  skipInstall: true,
  quiet: true,
  local: true,
  logger: new Logger({ quiet: true })
}

let appName, appPath

describe('utils/add-plugin', function () {
  describe('add local plugin', function () {
    this.timeout(5000)

    beforeEach(async () => {
      appName = `add-local-plugin-test-${Date.now()}`
      appPath = path.join(temp, appName)
      await createNewProject(temp, 'app', appName, defaultOptions)
    })

    it('should throw an error for unsupported plugin types', async () => {
      const addPlugin = require(modulePath)

      try {
        await addPlugin(appPath, 'not-a-plugin', 'plugins/test-provider', defaultOptions)
      } catch (err) {
        expect(err).to.be.an('error')
      }
    })

    it('should add an existing plugin directory within the current repo', async () => {
      const addPlugin = require(modulePath)

      // add a dummy provider
      const providerName = `test-provider-${Date.now()}`
      const providerPath = path.join(appPath, 'src', 'plugins', providerName)
      const indexPath = path.join(providerPath, 'index.js')
      await fs.outputFile(indexPath, 'modlue.exports = () => {}')

      // add the provider
      await addPlugin(appPath, 'provider', `plugins/${providerName}`, defaultOptions)
      expect(await fs.pathExists(path.join(appPath, 'test', 'plugins', providerName))).to.equal(false)

      // the initalizer is added into the existing provider path
      const initializerPath = path.join(providerPath, 'initialize.js')
      expect(await fs.pathExists(initializerPath)).to.equal(true)

      // the initializer can require the correct file
      const initializerContent = await fs.readFile(initializerPath, 'utf-8')
      expect(initializerContent).to.include("require('.')")
    })

    it('should add an existing plugin directory out of the current repo', async () => {
      const addPlugin = require(modulePath)

      // add a dummy provider
      const providerName = `test-provider-${Date.now()}`
      const providerPath = path.join(temp, providerName)
      const indexPath = path.join(providerPath, 'index.js')
      await fs.outputFile(indexPath, 'modlue.exports = () => {}')

      // add the provider
      await addPlugin(appPath, 'provider', `../../${providerName}`, defaultOptions)
      expect(await fs.pathExists(path.join(appPath, 'test', providerName))).to.equal(false)

      // the initalizer is added into the existing provider path
      const initializerPath = path.join(appPath, 'src', providerName, 'initialize.js')
      expect(await fs.pathExists(initializerPath)).to.equal(true)

      // TODO: windows sucks in "\" string
      if (os.platform() !== 'win32') {
        // the initializer can require the correct file
        const initializerContent = await fs.readFile(initializerPath, 'utf-8')
        const requirePath = path.join('..', '..', '..', providerName)
        expect(initializerContent).to.include(`require('${requirePath}')`)
      }
    })

    it('should add a provider plugin from a local path', async () => {
      const addPlugin = require(modulePath)
      await addPlugin(appPath, 'provider', 'plugins/test-provider', defaultOptions)

      const plugins = await fs.readFile(path.join(appPath, 'src', 'plugins.js'), 'utf-8')
      const expected = [
        "const testProvider = require('./plugins/test-provider/initialize')();",
        'const outputs = [];',
        'const auths = [];',
        'const caches = [];',
        'const plugins = [testProvider];',
        'module.exports = [...outputs, ...auths, ...caches, ...plugins];'
      ].join(os.EOL)
      expect(plugins).to.equal(expected)

      const srcPath = path.join(appPath, 'src/plugins/test-provider')
      expect(await fs.pathExists(path.join(srcPath, 'index.js'))).to.equal(true)
      expect(await fs.pathExists(path.join(srcPath, 'model.js'))).to.equal(true)
      expect(await fs.pathExists(path.join(srcPath, 'initialize.js'))).to.equal(true)

      // the index.js file should not refer to the packages.json and the koop.json
      const indexFileContent = await fs.readFile(path.join(srcPath, 'index.js'), 'utf-8')
      expect(indexFileContent.includes('package.json')).to.equal(false)
      expect(indexFileContent.includes('koop.json')).to.equal(false)
    })

    it('should add an auth plugin from a local path', async () => {
      const addPlugin = require(modulePath)

      await addPlugin(appPath, 'auth', 'my-auth', defaultOptions)

      const plugins = await fs.readFile(path.join(appPath, 'src', 'plugins.js'), 'utf-8')
      const expected = [
        "const myAuth = require('./my-auth/initialize')();",
        'const outputs = [];',
        'const auths = [myAuth];',
        'const caches = [];',
        'const plugins = [];',
        'module.exports = [...outputs, ...auths, ...caches, ...plugins];'
      ].join(os.EOL)
      expect(plugins).to.equal(expected)

      const srcPath = path.join(appPath, 'src/my-auth')
      expect(await fs.pathExists(path.join(srcPath, 'index.js'))).to.equal(true)
      expect(await fs.pathExists(path.join(srcPath, 'authenticate.js'))).to.equal(true)
      expect(await fs.pathExists(path.join(srcPath, 'authorize.js'))).to.equal(true)
      expect(await fs.pathExists(path.join(srcPath, 'initialize.js'))).to.equal(true)
      expect(await fs.pathExists(path.join(srcPath, 'authentication-specification.js'))).to.equal(true)
    })

    it('should add an output plugin from a local path', async () => {
      const addPlugin = require(modulePath)

      await addPlugin(appPath, 'output', 'my-output', defaultOptions)

      const plugins = await fs.readFile(path.join(appPath, 'src', 'plugins.js'), 'utf-8')
      const expected = [
        "const myOutput = require('./my-output/initialize')();",
        'const outputs = [myOutput];',
        'const auths = [];',
        'const caches = [];',
        'const plugins = [];',
        'module.exports = [...outputs, ...auths, ...caches, ...plugins];'
      ].join(os.EOL)
      expect(plugins).to.equal(expected)

      const srcPath = path.join(appPath, 'src/my-output')
      expect(await fs.pathExists(path.join(srcPath, 'index.js'))).to.equal(true)
      expect(await fs.pathExists(path.join(srcPath, 'routes.js'))).to.equal(true)
      expect(await fs.pathExists(path.join(srcPath, 'initialize.js'))).to.equal(true)
      expect(await fs.pathExists(path.join(srcPath, 'request-handlers/serve.js'))).to.equal(true)

      // the index.js file should not refer to the packages.json
      const indexFileContent = await fs.readFile(path.join(srcPath, 'index.js'), 'utf-8')
      expect(indexFileContent.includes('package.json')).to.equal(false)
    })

    it('should update the plugin list in koop.json', async () => {
      const addPlugin = require(modulePath)
      await addPlugin(appPath, 'provider', 'plugins/test-provider', defaultOptions)

      const koopConfig = await fs.readJson(path.join(appPath, 'koop.json'))
      const pluginInfo = koopConfig.plugins[0]

      expect(pluginInfo.name).to.equal('test-provider')
      expect(pluginInfo.type).to.equal('provider')
      expect(pluginInfo.srcPath).to.equal('plugins/test-provider')
      expect(pluginInfo.local).to.equal(true)
    })
  })
})
