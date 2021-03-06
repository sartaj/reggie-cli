import * as path from 'path'

import esops from '../../../'
import {getFileContents} from 'riteway-fs-snapshots/fs-utils'
import {withSnapshots} from 'riteway-fs-snapshots/withSnapshots'
import {withTempDir} from 'riteway-fs-snapshots/withTempDir'

const describe = withSnapshots(__filename)

const rootPath = path.join(__dirname, './module')

describe('esops() override features', async assert => {
  await withTempDir(__dirname, rootPath, async root => {
    await esops({root, prompts: [false]})
    await assert({
      given: 'no to override',
      should: 'not override files',
      snap: getFileContents(path.join(root, 'tsconfig.json'))
    })
  })

  await withTempDir(__dirname, rootPath, async root => {
    await esops({root, prompts: [true]})
    await assert({
      given: 'yes to override',
      should: 'override files',
      snap: getFileContents(path.join(root, 'tsconfig.json'))
    })
  })

  await withTempDir(__dirname, rootPath, async root => {
    await esops({root, prompts: [new Error()]})
    await assert({
      given: 'canceling prompt to override',
      should: 'not override files',
      snap: getFileContents(path.join(root, 'tsconfig.json'))
    })
  })
})
