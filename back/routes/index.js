import oauth from './oauth.js'
import mangas from './mangas.js'
import mangas$0 from './me/mangas.js'
import me from './me/me.js'
import batch from './admin/batch.js'
import tag from './admin/tag.js'
const routers = [
  oauth,
  mangas,
  mangas$0,
  me,
  batch,
  tag
]
export const load = function (app) {
  routers.forEach(x => x.load(app))
  process.env.DEBUG && app.post('/consolelogs', (req, res, next) => {
    console.log(...req.body.data)
    return res.send({ ok: true })
  })
}
export default {
  load
}
