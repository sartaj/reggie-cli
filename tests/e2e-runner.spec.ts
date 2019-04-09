/* 
  NOTE: This script only runs if process.env.NODE_ENV=== 'e2e'
 */

import * as spawn from 'await-spawn'
import {withTempDir} from './test-utils/withTempDir'

import {MOCK_STACKS, MOCK_COMPONENTS} from './examples'
import chalk from 'chalk'

function logTitle(title) {
  console.log(chalk.bold.blue(title))
}

async function run() {
  const esops = require('../library').default
  const esopsCli = require('../library/interfaces/cli').default

  logTitle('basic-bare-minimum')
  await withTempDir(
    __dirname,
    MOCK_COMPONENTS['basic-bare-minimum'],
    async root => {
      await esops({root})
    }
  )

  logTitle('basic-ignore-files')
  await withTempDir(
    __dirname,
    MOCK_COMPONENTS['basic-ignore-files'],
    async root => {
      await esops({root})
    }
  )

  logTitle('esops-typescript-open-source-module')
  await withTempDir(
    __dirname,
    MOCK_COMPONENTS['esops-typescript-open-source-module'],
    async root => {
      await esops({root})
    }
  )

  logTitle('basic-node-module')
  await withTempDir(__dirname, MOCK_STACKS['basic-node-module'], async root => {
    await spawn(`npm`, ['install'], {root})
    await esops({root})
  })

  logTitle('basic-bad-path')
  await withTempDir(__dirname, MOCK_STACKS['basic-bad-path'], async root => {
    await esops({root})
  })

  logTitle('basic-bad-config')
  await withTempDir(__dirname, MOCK_STACKS['basic-bad-config'], async root => {
    await esops({root})
  })

  logTitle('basic-no-config')
  await withTempDir(__dirname, MOCK_STACKS['basic-no-config'], async root => {
    await esops({root})
  })

  logTitle('basic-local-overwrite yes')
  await withTempDir(
    __dirname,
    MOCK_COMPONENTS['basic-local-overwrite'],
    async root => {
      await esops({root, prompts: [true]})
    }
  )

  logTitle('basic-local-overwrite no')
  await withTempDir(
    __dirname,
    MOCK_COMPONENTS['basic-local-overwrite'],
    async root => {
      await esops({root, prompts: [false]})
    }
  )

  logTitle('basic-overwrite-cwd-file cancel')
  await withTempDir(
    __dirname,
    MOCK_COMPONENTS['basic-local-overwrite'],
    async root => {
      await esops({root, prompts: [new Error('exit')]})
    }
  )

  logTitle('cli clean')
  await withTempDir(__dirname, [], async cwd => {
    await esopsCli(['clean'])
  })

  logTitle('cli help')
  await withTempDir(__dirname, [], async cwd => {
    await esopsCli(['help'])
  })
}

process.env.NODE_ENV === 'e2e' && run()
