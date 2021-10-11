#!/usr/bin/node
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'

import fs from 'fs'
import path from 'path'
import util from 'util'
import mongoose from 'mongoose'
import utils from '../test/utils/index.js'
import config from '../config/index.js'
import APH from '../lib/asyncPromiseHandler.js'
import { fileURLToPath } from 'url'
const optimist = yargs(hideBin(process.argv))
  .usage(`$0: node index.js
Apply patches since lastPatchRun (excluded). Updates lastPatchRun on success.
If -f xxx_name provided, only applies xxx_name.
`)
  .options('f', {
    alias: 'force',
    type: 'string',
    describe: 'only play patch of given folder name'
  })
const argv = optimist.argv
if (argv.help) {
  optimist.showHelp()
  process.exit(0)
}
const preadFile = util.promisify(fs.readFile)
const preaddir = util.promisify(fs.readdir)
const pwriteFile = util.promisify(fs.writeFile)
const DIRNAME = path.basename(fileURLToPath(import.meta.url))
const LAST_PATCH_RUN = path.join(DIRNAME, 'lastPatchRun.txt')

function getFileIndex (fname) {
  const f = fname.substring(0, 3)
  return parseInt(f, 10)
}

async function fetchPatchNames (lastPatchRun) {
  const data = await preadFile(lastPatchRun)
  const fname = data.toString().trim()
  // file is meant to be shared bug could be lost somehow
  // if does not exist ensure it to exist instead of assuming
  // it is the first time it is being run
  await import(path.join(DIRNAME, fname))
  const startIdx = getFileIndex(fname) + 1
  const files = await preaddir(DIRNAME)
  return files.reduce((arr, x) => {
    x = path.basename(x, '.js')
    if (!x.match(/^\d{3}/) || getFileIndex(x) < startIdx) {
      return arr
    }
    return arr.concat(x)
  }, []).sort((a, b) => getFileIndex(a) - getFileIndex(b))
}

async function main () {
  mongoose.set('debug', true)
  let patchNames = []
  let onSuccess = _ => 1
  if (argv.force) {
    patchNames = [path.dirname(argv.force)]
    console.log('force > run', argv.force)
  } else {
    patchNames = await fetchPatchNames(LAST_PATCH_RUN)
    onSuccess = lastName => pwriteFile(LAST_PATCH_RUN, lastName)
  }
  if (!patchNames.length) {
    console.log('no patch run')
    return
  }
  for (const aName of patchNames) {
    try {
      const name = aName.endsWith('.js') ? aName : aName.endsWith('index') ? aName + '.js' : path.join(aName, 'index.js')
      const mod = await import(`./${name.replace('patches/', '')}`)
      console.log('> run', name)
      config.logger.inf('> run', name)
      await mod.run()
      console.log(' ok ', name)
    } catch (e) {
      console.log('err patch', aName, e, e.stack)
      throw e
    }
  }
  const lastName = patchNames[patchNames.length - 1]
  return Promise.all([onSuccess(lastName), APH.all()])
}

utils.runImport(main)
