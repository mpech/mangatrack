import { html } from 'hybrids'
import { ops } from '@/config'
import MtLayout from '@/components/layout'
import MtH1 from '@/components/h1'

// https://github.com/dysfunc/ascii-emoji/blob/master/emojis
export default {
  tag: 'MtNotFound',
  page: {
    get: () => window.location
  },
  render: ({ page }) => html`
<mt-layout>
  <div class="notFound">
    <mt-h1>Page not found :(</mt-h1>
    <p>The url (${page}) you requested is not valid. Likely I did not do the site properly. Sorry for that.</p>
    <p>To follow up that error, you may visit <a href="${ops.bug_tracker}">the repo</a> and create an issue if none of the same kind exist.</p>
    <p>Thanks!</p>
  </div>
</mt-layout>
  `.style`

  `.define(MtLayout, MtH1)
}
