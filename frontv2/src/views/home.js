import { html, define } from 'hybrids'
import MtLayout from '/containers/layout'
import MtFilterForm from '../components/filterForm'
const Home = {
  mount: () => {
    console.log('mount?')
  },
  render: () => html`
    <mt-layout>
      <mt-filter-form></mt-filter-form>
      <!--<mt-grid :mangas="mangas" :myMangas="myMangas" :more="more"></mt-grid>-->
    </mt-layout>
`.define({ MtLayout, MtFilterForm })
}
export default Home