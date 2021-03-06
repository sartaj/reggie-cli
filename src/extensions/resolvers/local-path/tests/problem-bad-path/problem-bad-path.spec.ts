import * as path from 'path'
import {Try} from 'riteway'

import esops from '../../../../../index'
import {cleanErrorString} from 'riteway-fs-snapshots/fs-utils'
import {withSnapshots} from 'riteway-fs-snapshots/withSnapshots'
import {withTempDir} from 'riteway-fs-snapshots/withTempDir'

const rootPath = path.join(__dirname, './module')

const describe = withSnapshots(__filename)

describe('esops() user errors', async assert => {
  await withTempDir(__dirname, rootPath, async root => {
    const cleanError = cleanErrorString(root)
    const snap = cleanError(await Try(esops, {root}))
    await assert({
      given: 'a bad path in the config',
      should: 'throw a friendly error',
      snap
    })
  })

  // await withTempDir(__dirname, MOCK_STACKS['basic-bad-config'], async root => {
  //   const snap = cleanErrorString(root)(await Try(esops, {root}))
  //   await assert({
  //     given: 'an invalid config object',
  //     should: 'throw a friendly error',
  //     snap
  //   })
  // })
})
