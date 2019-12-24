import { configure } from '@storybook/vue';

import '../node_modules/purecss/build/pure-min.css'
import '../node_modules/purecss/build/grids-responsive-min.css'
import '../node_modules/@trevoreyre/autocomplete-vue/dist/style.css'
import '../src/index.css'

configure(require.context('../src/components', true, /\.stories\.js$/), module);