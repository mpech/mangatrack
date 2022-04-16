import { html } from 'hybrids'
import { oauth } from '@/config'

const fbOauth = ({ uri }) => {
  window.location.href = this.uri
}

const uri = `${oauth.facebook_endpoint}?response_type=code&\
client_id=${oauth.facebook_clientId}&\
redirect_uri=${oauth.facebook_redirect_uri}&\
scope=${oauth.facebook_scope}&\
state=${oauth.self_callback}`

export default {
  tag: 'mt-facebook-btn',
  uri,
  render: () => html`
  <button class="loginBtn loginBtn--facebook" onclick="${fbOauth}">
    Login with Facebook
  </button>
  `.style`
/* Shared*/

.loginBtn {
  box-sizing: border-box;
  position: relative;
  /* width: 13em;  - apply for fixed size */
  padding: 0 15px 0 46px;
  border: none;
  text-align: left;
  line-height: 34px;
  white-space: nowrap;
  border-radius: 0.2em;
  font-size: 16px;
  color: #FFF;
  cursor: pointer;
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

.loginBtn--facebook {
  background-color: #4C69BA;
  background-image: linear-gradient(#4C69BA, #3B55A0);
  /*font-family: "Helvetica neue", Helvetica Neue, Helvetica, Arial, sans-serif;*/
  text-shadow: 0 -1px 0 #354C8C;
}
.loginBtn--facebook:before {
  border-right: #364e92 1px solid;
  background: url('https://s3-us-west-2.amazonaws.com/s.cdpn.io/14082/icon_facebook.png') 6px 6px no-repeat;
}
.loginBtn--facebook:hover,
.loginBtn--facebook:focus {
  background-color: #5B7BD5;
  background-image: linear-gradient(#5B7BD5, #4864B1);
}
  `
}
