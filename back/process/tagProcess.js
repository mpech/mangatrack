import TagActivity from '../activity/tagActivity.js'
import * as utils from '../test/utils/index.js'
import yargs from 'yargs'
import { fileURLToPath } from 'url'
import { hideBin } from 'yargs/helpers'
import { tagEnum } from '../lib/rules.js'

export const runTag = async function ({ word, tags, nameId }) {
  const activity = new TagActivity()
  return activity.tag({ word, tags, nameId })
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const optimist = yargs(hideBin(process.argv)).usage(`$0: node tagProcess.js -w link -t tag,tag2[,...tag]
  Tag given word`).options('w', {
    alias: 'word',
    type: 'string',
    describe: 'Any word'
  }).options('n', {
    alias: 'nameId',
    type: 'string',
    describe: 'manga nameId'
  })
    .options('t', {
      alias: 'tags',
      type: 'string',
      describe: 'jn, kr or cn comma separated'
    })
  const argv = optimist.argv
  if (argv.help) {
    optimist.showHelp()
    process.exit(0)
  }
  if (!argv.word && !argv.nameId) {
    throw new Error('expect at least nameId or word')
  }
  let tags
  if (argv.word) {
    if (!argv.tags) {
      throw new Error('expect tags if word given')
    }
    tags = argv.tags.split(',').map(x => x.trim())

    // nb: we allow tag to be unsetted by giving empty string
    const err = tags.find(x => tagEnum.validate(x).error)
    if (err) {
      throw new Error(`invalid tag ${err}`)
    }
  }

  utils.runImport(async (_) => {
    return runTag(Object.assign(
      { tags },
      argv.word ? { word: argv.word } : {},
      argv.nameId ? { nameId: argv.nameId } : {}
    ))
  })
}
const exports = { runTag }
export default exports
