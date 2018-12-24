import * as path from 'path'

import * as fs from 'fs-plus'

export const getSortedFilePaths = dir =>
  fs
    .listTreeSync(dir)
    .sort()
    .map(abs => path.relative(dir, abs))

export const getFileContents = dir => fs.readFileSync(dir, {encoding: 'utf-8'})

export const getJsonContents = dir => JSON.parse(getFileContents(dir))
