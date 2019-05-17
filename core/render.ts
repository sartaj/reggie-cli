import * as stringify from 'json-stable-stringify'
import {mergeDeepRight} from 'ramda'
import async from '../utilities/async'
import {throwError, parseJSON} from '../utilities/sync'
import {FileNotToggledForMerge} from './messages'
import {listFileTreeSync} from './resolver'
import {
  checkIfShouldGitPublish,
  checkIfShouldMergeFile,
  checkIfShouldMergeJson,
  resolveToggles
} from './toggles-check'
import {Params, SanitizedComponent, Report} from './types'

/**
 * Render Path
 */
export const renderComponent = async (
  params,
  component: SanitizedComponent
): Promise<Report> => {
  const {
    effects: {ui, filesystem}
  } = params
  const {path} = filesystem

  const tab = ui.getTabs(params.treeDepth)
  const [localComponentPath, variables, options] = component
  ui.info(`${tab}  rendering`)

  const filesInComponent = listFileTreeSync(params)(localComponentPath)

  const {filesWithoutToggles, toggles} = await resolveToggles(params)(
    filesInComponent
  )

  const renderPrepPath = await filesystem.appCache.getRenderPrepFolder()

  type Actions = {from: string; to: string; relativePath: string}
  const actions: Actions[] = await async.seriesPromise(
    async.mapToAsync(async from => {
      const relativePath = path.relative(localComponentPath, from)
      return {
        ...{
          from,
          to: path.join(renderPrepPath, relativePath),
          relativePath
        },
        ...checkIfShouldMergeJson(toggles, relativePath),
        ...checkIfShouldMergeFile(toggles, relativePath),
        ...checkIfShouldGitPublish(toggles, relativePath)
      }
    })(filesWithoutToggles)
  )

  const mergeJSON = async manifest => {
    const {filesystem} = params.effects

    const prevJson = filesystem.existsSync(manifest.to)
    if (prevJson) {
      const prev = parseJSON(filesystem.readFileSync(manifest.to, 'utf-8'))
      const next = parseJSON(filesystem.readFileSync(manifest.from, 'utf-8'))
      const merged = mergeDeepRight(prev, next)
      const newFile = stringify(merged, {space: 2})
      filesystem.writeFileSync(manifest.to, newFile)
    } else {
      filesystem.forceCopy(manifest.from, manifest.to)
    }
  }

  const mergeFile = async manifest => {
    const {filesystem} = params.effects

    const prevFile = filesystem.existsSync(manifest.to)
    if (prevFile) {
      const prev = filesystem.readFileSync(manifest.to, 'utf-8')
      const next = filesystem.readFileSync(manifest.from, 'utf-8')
      const merged = prev + '\n' + next
      const newFile = merged
      filesystem.writeFileSync(manifest.to, newFile)
    } else {
      filesystem.forceCopy(manifest.from, manifest.to)
    }
  }

  const overrideFile = async manifest => {
    try {
      const fileAlreadyRendered = filesystem.existsSync(manifest.to)
      if (fileAlreadyRendered) {
        throw new Error(FileNotToggledForMerge(manifest))
      } else {
        filesystem.forceCopy(manifest.from, manifest.to)
      }
    } catch (e) {
      throw e
    }
  }

  const renderManifest = async manifest => {
    // TODO: Need to detect if first file doesn't allow merge
    if (manifest.shouldMergeJson) await mergeJSON(manifest)
    else if (manifest.shouldMergeFile) await mergeFile(manifest)
    else await overrideFile(manifest)
    return {
      ...manifest,
      success: true
    }
  }

  const renderReport = await async
    .seriesPromise(
      actions.map(manifest => async () => {
        try {
          return await renderManifest(manifest)
        } catch (e) {
          throw e
        }
      })
    )
    .catch(throwError)

  ui.info(`${tab}  rendered`)
  return renderReport
}