import mongoose from 'mongoose'
const Schema = mongoose.Schema

const pTimeout = async t => t <= 0 || new Promise(resolve => setTimeout(resolve, t))

const schema = new Schema({
  type: { type: String, enum: ['link'], required: true },
  tasks: [{ type: Schema.Types.Mixed }],
  lastAt: { type: Number, default: Date.now } // last execution done
})

// up to fn to implement retry mechanism
schema.methods._processTask = async function (fn, task) {
  await this.save() // save "unshifted" task
  await fn(task)
  this.lastAt = Date.now()
  await this.save()
}

// beware of concurrent access, not handled for simplicity
schema.statics.load = function (type) {
  return this.findOneAndUpdate({ type }, { $set: { type } }, { upsert: true, new: true })
}

schema.methods.restart = async function (fn) {
  if (!fn) throw new Error('expect task processor')
  const task = this.tasks.shift()
  if (!task) { return }
  const now = Date.now()
  await pTimeout(Math.max(0, this.lastAt + task.delay - now))
  await this._processTask(fn, task)
  await this.restart(fn)
}

schema.methods.queueAll = async function (vArgs, delay) {
  if (typeof (delay) !== 'number') throw new Error('expect delay')
  this.tasks.push(...vArgs.map(args => ({ delay, args })))
  await this.save()
}
export default mongoose.model('Fifo', schema, 'fifos')
