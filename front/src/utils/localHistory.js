const localHistory = {
  MAX_ITEMS: 5,
  _getHistory: () => JSON.parse(window.localStorage.getItem('localHistory') || '{"idx": -1,"states":[]}'),
  _setHistory: h => window.localStorage.setItem('localHistory', JSON.stringify(h)),
  push (state) {
    const { idx, states } = this._getHistory()

    const nextIdx = (idx + 1) % this.MAX_ITEMS
    const nextStates = states.slice(0)
    nextStates[nextIdx] = state
    const nextHistory = {
      idx: nextIdx,
      states: nextStates
    }
    this._setHistory(nextHistory)
  },
  find (fn) {
    const { idx, states } = this._getHistory()
    const v = []
    const n = states.length
    for (let a = 0; a < n; ++a) {
      const it = (idx - a + n) % n
      v.push(states[it])
    }
    return v.find(fn)
  }
}

export default localHistory
