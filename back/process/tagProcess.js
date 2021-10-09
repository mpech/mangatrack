import TagActivity from '../activity/tagActivity.js'
import * as utils from '../test/utils/index.js'
import yargs from 'yargs'
import { fileURLToPath } from 'url'
import { hideBin } from 'yargs/helpers'
import { tagEnum } from '../lib/rules.js'

export const runTag = async function ({ word, tags }) {
  const activity = new TagActivity()
  return activity.tag({ word, tags })
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const optimist = yargs(hideBin(process.argv)).usage(`$0: node tagProcess.js -w link -t tag,tag2[,...tag]
  Tag given word`).options('w', {
    alias: 'word',
    type: 'string',
    describe: 'Any word',
    required: true
  })
    .options('t', {
      alias: 'tags',
      type: 'string',
      describe: 'jn, kr or cn comma separated',
      required: true
    })
  const argv = optimist.argv
  if (argv.help) {
    optimist.showHelp()
    process.exit(0)
  }
  const tags = argv.tags.split(',').map(x => x.trim())

  // nb: we allow tag to be unsetted by giving empty string
  const err = tags.find(x => tagEnum.validate(x).error)
  if (err) throw new Error(`invalid tag ${err}`)
  utils.runImport(async (_) => {
    return runTag({ word: argv.word, tags })
  })
}
const exports = { runTag }
export default exports
