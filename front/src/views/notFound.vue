<template>
  <div class="notFound">
    <h1>Page not found</h1>
    <img src="${ops.url_404}" title="404"/>
    <p>The url you requested is not valid. Likely I did not do the site properly. Sorry for that.</p>
    <p>To follow up that error, you may visit <a href="${ops.bug_tracker}">the repo</a> and create an issue if none of the same kind exist.</p>
    <p>Thanks!</p>
  </div>
</template>

<script>
import { ops } from '../config.js'

var NotFoundComponent = {}
export default NotFoundComponent
</script>