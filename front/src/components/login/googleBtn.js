import { html } from 'hybrids'
import { oauth } from '@/config.js'
import darkNormal from '@/assets/google/btn_google_signin_dark_normal_web.png'
import darkFocus from '@/assets/google/btn_google_signin_dark_focus_web.png'
import darkPressed from '@/assets/google/btn_google_signin_dark_pressed_web.png'

const uri = `${oauth.google_endpoint}?response_type=code&\
client_id=${oauth.google_clientId}&\
redirect_uri=${oauth.google_redirect_uri}&\
scope=${oauth.google_scope}&\
state=${oauth.self_callback}`

export default {
  tag: 'mt-google-btn',
  uri,
  render: () => html`
    <a href="${uri}" style="display:inline-block;" class="google loginBtn loginBtn--google"></a>
    <img src="${darkFocus}"/>
    <img src="${darkPressed}"/>
  `.style(`
/* Shared */
.loginBtn {
  box-sizing: border-box;
  position: relative;
  /* width: 13em;  - apply for fixed size */
  padding: 0 15px 0 46px;
  margin: -0.2em;
  border: none;
  text-align: left;
  line-height: 34px;
  white-space: nowrap;
  border-radius: 0.2em;
  font-size: 16px;
  color: #FFF;
}
.loginBtn:before {
  content: "";
  box-sizing: border-box;
  position: absolute;
  top: 0;
  left: 0;
  width: 34px;
  height: 100%;
}
.loginBtn:focus {
  outline: none;
}
.loginBtn:active {
  box-shadow: inset 0 0 0 32px rgba(0,0,0,0.1);
}

/*----*/

a{
  display:block;
  height:46px;
  width:191px;
  background: url(${darkNormal})
}
a:hover{
  background: url(${darkFocus})
}
a:active{
  background: url(${darkPressed})
}
img {
  visibility:hidden;
  position:absolute;
}
  `)
}
