import { html } from 'hybrids'
import MtLayout from '/containers/layout'
const Me = {
  render: () => html`
    <mt-layout>
      <div>me----------------------</div>
    </mt-layout>
  `.define({ MtLayout })
}
export default Me