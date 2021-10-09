import assert from 'assert'
import { tag, getTokens } from '../../lib/tagger/index.js'

// https://docs.google.com/spreadsheets/d/1uaUcQNyADAwP4k5rb0UNiQ1c8wPtWl1plqDHQryr75E/edit#gid=0
// TODO: fetch the hiragana and convert it to romaji ?
// --> this will make a dictionary of romaji to match against description
describe('lib/tagger', function () {
  describe('getTokens', () => {
    it('tokensize spaces', () => {
      assert.deepStrictEqual(getTokens('aa bb   cc  \n dd'), ['aa', 'bb', 'cc', 'dd'])
    })
    it('tokensize htmlentities', () => {
      assert.deepStrictEqual(getTokens('aa&lt;bb&gt;cc&quot;dd'), ['aa', 'bb', 'cc', 'dd'])
    })
  })
  describe('tag', () => {
    it('tags jn by words', async () => {
      assert.deepStrictEqual(await tag('san ie'), ['jn'])
    })
    it('tags jn by names', async () => {
      assert.deepStrictEqual(await tag('Tanaka'), ['jn'])
    })
    it('tags cn by name', async () => {
      assert.deepStrictEqual(await tag('Fang Tian'), ['cn'])
    })
    it('tags kr by name', async () => {
      assert.deepStrictEqual(await tag('Sung Jinwoo'), ['kr'])
    })
    it('tags kr by chars', async () => {
      assert.deepStrictEqual(await tag('미터 사이'), ['kr'])
    })
    it('tags kr even if Hosu is jap', async () => {
      const s = 'Hosu isple steps away… Between 1 Meter / 1미터 사이mangakakalot'
      assert.deepStrictEqual(await tag(s), ['kr'])
    })
    it('tags cn by punctuation', async () => {
      const s = 'Breaking news!! A new series to bring you the latest events and characters from the game "Azur Lane" as fast as possible! Bringing you plenty of comics to make you love Azur Lane even more!'
      assert.deepStrictEqual(await tag(s), ['cn'])
    })
    it('can tags Ye for kr an cn but only Eun for kr', async () => {
      const s = 'Ye Eun'
      assert.deepStrictEqual(await tag(s), ['kr'])
    })
    it('tags jn even though lot of punctuation shit', async () => {
      const s = 'Bijin Onna Joushi Takizawa-san A sexy-boss has arrived!!!!!!!!!!!!!!!!!!!!!! Welcome to the Comedy-Ecchi at work!!'
      assert.deepStrictEqual(await tag(s), ['jn'])
    })
    it('can extract names if compound with -', async () => {
      const s = 'Na Hwa-jin, a member of the '
      assert.deepStrictEqual(await tag(s), ['kr'])
    })
    it('recognize some jn words', async () => {
      const s = 'Fushi no Sougishi'
      assert.deepStrictEqual(await tag(s), ['jn'])
    })
    it('ignores kana word if actually a name (Kana)', async () => {
      const s = 'Lee Gyuntak And who in the world is Kana'
      assert.deepStrictEqual(await tag(s), ['kr'])
    })
    it('tags jn via additionalTags from names', async () => {
      const s = 'Lee Gyuntak vs Groo Tagg'
      assert.deepStrictEqual(await tag(s, { jn: new Set(['Groo', 'Tagg']) }), ['jn'])
    })
    it('tags jn via additionalTags from words', async () => {
      const s = 'Lee Gyuntak vs groo tagg'
      assert.deepStrictEqual(await tag(s, { jn: new Set(['groo', 'tagg']) }), ['jn'])
    })
  })
})
