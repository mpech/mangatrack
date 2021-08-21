import { html, define } from 'hybrids'
import MtLayout from '/containers/layout'
import MtFilterForm from '/components/filterForm'
import MtGrid from '/components/grid'

const Home = {
  render: () => html`
    <mt-layout>
      <mt-filter-form></mt-filter-form>
      <mt-grid :mangas="mangas" :myMangas="myMangas" :more="more"></mt-grid>
    </mt-layout>
`.style(`
  :host mt-filter-form {
    margin-top: 20px;
  }
`).define({ MtLayout, MtFilterForm, MtGrid })
}

export default Home