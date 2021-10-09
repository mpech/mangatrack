import { loadJsonFile } from 'load-json-file'
import fs from 'fs'
import { fileURLToPath } from 'url'
import path from 'path'

let jnNames = null
let jnWords = null
let jnChars = null
let cnNames = null
let krNames = null
let krChars = null
let state = null
const punctuations = ['?', '!', '“', '"']
const stopWords = new Set(['me', 'on', 'you', 'make', 'take', 'in', 'man', 'You', 'On', 'son', 'en', 'go'])
const toSet = x => {
  const v = Array.isArray(x)
    ? x
    : x.toString().split(/\s/).filter(x => x.trim().length)// no lower case

  return new Set(v.filter(y => !stopWords.has(y)))
}
const relPath = x => {
  const dir = path.dirname(fileURLToPath(import.meta.url))
  const res = path.join(dir, x)
  return res
}
const load = async () => {
  state = state || Promise.all([
    // to do: prefilter words matching eng dic
    loadJsonFile(relPath('jn/words.json')).then(toSet).then(x => { jnWords = x }),
    fs.promises.readFile(relPath('jn/chars.txt')).then(toSet).then(x => { jnChars = x }),
    fs.promises.readFile(relPath('./jn/names.txt')).then(toSet).then(x => { jnNames = x }),
    fs.promises.readFile(relPath('./cn/names.txt')).then(toSet).then(x => { cnNames = x }),

    fs.promises.readFile(relPath('./kr/names.txt')).then(toSet).then(x => { krNames = x }),
    fs.promises.readFile(relPath('./kr/chars.txt')).then(toSet).then(x => { krChars = x })
  ])
  return state
}

export const getTokens = txt => txt
  .split(/(?:&[a-z]+;|[\W])+/)
  .filter(t => t.length > 1)

const jnTag = 'jn'
const cnTag = 'cn'
const krTag = 'kr'
const softmax = (v) => {
  const s = v.reduce((s, x) => s + Math.exp(x), 0)
  return v.map(x => Math.exp(x) / s)
}
const scal = (a, b) => {
  return a.map((x, i) => b[i] ? a[i] * b[i] : 0)
}
const _tagIt = (dic, { countPunctuation, len }) => {
  // strong chinese discriminant... review that
  let tagByPunctuation = false
  if (countPunctuation >= 3 && countPunctuation / len > 0.05) {
    tagByPunctuation = cnTag
  }
  const tags = [jnTag, cnTag, krTag]
  const pBag = softmax(tags.map(tag => dic[tag].bag.size))
  const pNChars = softmax(tags.map(tag => dic[tag].nChars))
  const v = scal(pBag, pNChars)
  const imax = v.indexOf(Math.max(...v))

  // TODO: be smarter
  if (v[imax] === v[(imax + v.length + 1) % v.length]) {
    return [tagByPunctuation].filter(Boolean)
  }
  const tag = tags[imax]
  return [tag]
}

export const tag = async (txt = '') => {
  await load()
  const [jn, cn, kr] = [0, 0, 0].map(() => ({ bag: new Set(), nChars: 0 }))
  const dic = { [jnTag]: jn, [cnTag]: cn, [krTag]: kr }
  const tokens = getTokens(txt)
  const len = tokens.length

  kr.nChars = [...txt.matchAll(new RegExp(`[${[...krChars].join('')}]`, 'g'))].length
  jn.nChars = [...txt.matchAll(new RegExp(`[${[...jnChars].join('')}]`, 'g'))].length
  tokens.forEach(aTok => {
    const tokNames = aTok.split('-')
    const isName = [[cnTag, cnNames], [krTag, krNames], [jnTag, jnNames]].map(([tag, names]) => {
      if (tokNames.some(x => names.has(x))) {
        dic[tag].bag.add(aTok)
        return true
      }
      return false
    }).some(Boolean)

    if (isName) { return }
    const tok = aTok.toLowerCase()
    if (jnWords.has(tok)) {
      jn.bag.add(tok)
    }
  })

  // console.log('dic : ', dic)
  // TODO: CN: maybe Chang* should always match
  const r = new RegExp(`[${punctuations.join('')}]`, 'g')
  const countPunctuation = [...txt.matchAll(r)].length
  const res = await _tagIt(dic, { countPunctuation, len })
  return res
}
