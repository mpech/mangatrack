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
          type="text"
          placeholder="https://mangakakalot.com/manga/versatile_mage"
          pattern="^https://(mangakakalot.com|manganelo.com|fanfox.net)/manga/[^/]+/?"
          required
        />
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
      const link = this.$el.querySelector('input').value
      this.$emit('importLink', link)
      return false
    }
  }
}
export default LinkImporter
</script>