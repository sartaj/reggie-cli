export const InvalidOptsError = () => `Your stack has not been defined.
Please add a stack config to \`esops.json\` or \`package.json\``

export const StackConfig = opts => `# Stack Configuration
${typeof opts === 'string' ? opts : JSON.stringify(opts, null, 2)}`

export const NoPathError = ({
  pathString,
  cwd
}) => `Path \`${pathString}\` not found.

## Current Working Directory
\`${cwd}\`

Allowed paths include:

- filesystem paths: \`'./infrastructure'\`
- node modules: \`'node:@myorg/my-stack/stack'\`
`

export const FinalReport = ({
  gitignoreUpdated,
  generatorManifest,
  cwd
}) => `# Your Directory has Been Updated.

## Files Added

${generatorManifest
  .map(({relativePath}) => '* `' + relativePath + '`')
  .join('\n')}

## Current Working Directory
\`${cwd}\`

## Notes

${gitignoreUpdated ? '.gitignore has been updated.' : ''}
`
