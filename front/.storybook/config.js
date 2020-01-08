import { configure } from '@storybook/vue';

import '../node_modules/purecss/build/pure-min.css'
import '../node_modules/purecss/build/grids-responsive-min.css'
import '../node_modules/@trevoreyre/autocomplete-vue/dist/style.css'
import '../src/index.css'

const reqs = [
  require.context('../src/components', true, /\.stories\.js$/),
  require.context('../src/views', true, /\.stories\.js$/)
]
function loadStories () {
  reqs.forEach(req => {
    req.keys().forEach(filename => req(filename))
  })
}
configure(loadStories, module)