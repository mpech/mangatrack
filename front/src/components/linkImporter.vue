<template>
  <form class="pure-form linkImporter" @submit="onsubmit" action="#incase">
    <fieldset>
      <legend>Import from a link</legend>
      <div>
        <table class="mq-table pure-table-bordered pure-table">
          <caption>Examples</caption>
          <thead>
            <th>from</th>
            <th>url</th>
          </thead>
          <tbody>
            <tr><td>mangakakalot</td><td>https://mangakakalot.com/manga/versatile_mage</td></tr>
            <tr><td>fanfox</td><td>https://fanfox.net/manga/versatile_mage/</td></tr>
          </tbody>
        </table>
      </div>

      <div class="fields">
        <input 
          class="pure-input-1-2"
          name="link"
          type="text"
          placeholder="https://mangakakalot.com/manga/versatile_mage"
          pattern="^https://(mangakakalot.com|manganelo.com|fanfox.net)/manga/[^/]+/?"
          required
        />
        <label for="thumb" class="pure-checkbox">
          <input type="checkbox" id="thumb" name="thumb"/> Refresh thumb
        </label>
        <label for="description" class="pure-checkbox">
          <input type="checkbox" id="description" name="description"/> Refresh description
        </label>
        <button type="submit" class="pure-button pure-button-primary pure-input">Import</button>
      </div>
    </fieldset>
  </form>
</template>

<style scoped>
.linkImporter div {
  margin-top: 2em;
}
</style>
<script>
const LinkImporter = {
  methods: {
    onsubmit (e) {
      e.preventDefault()
      const elements = this.$el.elements
      const link = elements['link'].value
      const refreshThumb = elements['thumb'].checked
      const refreshDescription = elements['description'].checked
      this.$emit('importLink', { link, refreshThumb, refreshDescription })
      return false
    }
  }
}
export default LinkImporter
</script>