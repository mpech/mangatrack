#!/usr/bin/node
const optimist = require('yargs')
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

const fs = require('fs')
const path = require('path')
const util = require('util')
const mongoose = require('mongoose')
const utils = require('../test/utils')
const config = require('../config')
const APH = require('../lib/asyncPromiseHandler')
const preadFile = util.promisify(fs.readFile)
const preaddir = util.promisify(fs.readdir)
const pwriteFile = util.promisify(fs.writeFile)
const LAST_PATCH_RUN = path.join(__dirname, 'lastPatchRun.txt')

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
  require(path.join(__dirname, fname))
  const startIdx = getFileIndex(fname) + 1
  const files = await preaddir(__dirname)
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
    patchNames = [path.basename(argv.force, '.js')]
    console.log('force > run', argv.force)
  } else {
    patchNames = await fetchPatchNames(LAST_PATCH_RUN)
    onSuccess = lastName => pwriteFile(LAST_PATCH_RUN, lastName)
  }
  if (!patchNames.length) {
    console.log('no patch run')
    return
  }
  for (const name of patchNames) {
    try {
      const mod = require(`./${name}`)
      console.log('> run', name)
      config.logger.inf('> run', name)
      await mod.run()
      console.log(' ok ', name)
    } catch (e) {
      console.log('err patch', name, e, e.stack)
      throw e
    }
  }
  const lastName = patchNames[patchNames.length - 1]
  return Promise.all([onSuccess(lastName), APH.all()])
}

utils.runImport(main)
