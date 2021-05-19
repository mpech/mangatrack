const path = require('path');
const fs = require('fs')
const listFolders = loc => {
  return fs.readdirSync(loc, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(x => x.name)
    .reduce((o, name) => (o[name] = path.resolve(loc, name), o), {})
}
const hybridsHmr = () => ({
  name: 'hybridsHmr',
  transform (src, id) {
    if (id !== __dirname + '/app.js') { return }
    console.log('transform?', id)
    return {
      code: src + `
if (import.meta.hot) {
  import.meta.hot.accept(() => console.log('refresh'))
}
`,
      map: null
    }
  }
})
module.exports = {
  'resolve.alias': listFolders(__dirname),
  plugins: [hybridsHmr()]
}