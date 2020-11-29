import { html, define } from 'hybrids'
import MtLayout from '/containers/layout'

const Home = {
  render: () => html`
    <mt-layout>
      home
    </mt-layout>
`.define({ MtLayout })
}
export default Home