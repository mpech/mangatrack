import esbuild from 'esbuild'
import fs from 'fs'
import path from 'path'
import { SRC_PATH } from './vite.config.js'

const main = async () => {
  const options = {
    bundle: true,
    sourcemap: true,
    minify: true
  }
  const outfile = `app-${Date.now()}.js`
  await fs.promises.rm('./dist', { recursive: true, force: true })
  await esbuild.build({
    ...options,
    entryPoints: ['./src/app.js'],
    outfile: './dist/' + outfile,
    plugins: [{
      name: 'alias-vite',
      setup(build) {
        build.onResolve({ filter: /^@/ }, async args => {
          return { path: SRC_PATH + '/' + args.path.replace('@/', '') + '.js' }
        })
      }
    }]
  })
  await Promise.all([
    fs.promises.readFile('src/index.html').then(file => {
      const next = file.toString().replace('app.js', outfile)
      return fs.promises.writeFile('dist/index.html', next)
    }),
    fs.promises.cp('src/assets', 'dist/assets', { recursive: true })
  ])
}

main()
