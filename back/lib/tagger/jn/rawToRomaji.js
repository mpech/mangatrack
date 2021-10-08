import fs from 'fs'
import waka from 'wanakana'

// TODO compare against eng dic instead of doing it stupidly
const STOP_WORDS = new Set([
  // "aa",
  'ai',
  'an',
  // "ao",
  'au',
  'ba',
  // "en",
  'fu',
  'ge',
  // "go",
  // "ha",
  // "hi",
  'ie',
  'ii',
  'iu',
  'ji',
  'ka',
  'ke',
  'ki',
  'ko',
  'ku',
  'ma',
  // "me",
  'mi',
  'na',
  'ne',
  'ni',
  'oi',
  // "on",
  'ou',
  'sa',
  'se',
  'su',
  'ta',
  'te',
  // "to",
  'ue',
  'un',
  // "yo",
  'yu',
  'zu'
].concat([
  'ago',
  'ami',
  'ane',
  'are',
  'bon',
  'pen',
  'pin'
]).concat([
  'papa',
  'zero'
])

)
const res = fs.readFileSync('./words_raw.tsv')
  .toString()
  .split('\n')
  .filter(x => x.length)
  .map(x => x.split(/\t/)[8])
  .map(waka.toRomaji)
const words = [...new Set(res)]
  .sort((a, b) => a.localeCompare(b))
  .filter(x => x.length > 1 && !STOP_WORDS.has(x))

fs.writeFileSync('words.json', JSON.stringify(words, null, 1))
