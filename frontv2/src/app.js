import { html, define } from 'hybrids'
import MtRouter from '/views/router'

const defs = {
  MtRouter
}

const App = {
  render: () => html`
    <mt-router/>
  `.define(defs)
}

define('mt-app', App)
