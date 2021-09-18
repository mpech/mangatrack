const path = require('path')
const { defineConfig } = require('vite')
const SRC_PATH = path.join(__dirname, '/src')

const hybridsHmr = () => ({
  name: 'hybridsHmr',
  transform (src, id) {
    if (id !== path.join(SRC_PATH, 'app.js')) { return }
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

module.exports = defineConfig({
  root: SRC_PATH,
  build: {
    outDir: path.join(__dirname, 'dist')
  },
  resolve: {
    alias: [
      {
        find: '@',
        replacement: SRC_PATH
      }
    ]
  },
  plugins: [process.env.NODE_ENV !== 'production' && hybridsHmr()]
})
