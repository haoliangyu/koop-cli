const scripts = Object.freeze({
  NPM_INSTALL: 'npm install --quiet',
  NPM_UNINSTALL: 'npm uninstall --quiet',
  NPM_INSTALL_QUICK: 'npm install --quiet --production --no-package-lock --no-audit',
  YARN_INSTALL: 'yarn install --silent',
  YARN_ADD: 'yarn add --silent',
  YARN_REMOVE: 'yarn remove --silent',
  GIT_INIT: 'git init --quiet'
})

/**
 * a collection of scripts
 */
module.exports = scripts
