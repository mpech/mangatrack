Regarding oauth.

We are only authenticating via Google and Facebook.

No email/password since we would have to handle dupplicate & all which is too burdensome.

Flow is like

1. get access token

The flow is very much like https://developers.google.com/identity/sign-in/web/server-side-flow

    user      google                            api
    |           |                                |
    |--auth---->|                                |
    |           |                                |           
    |           |-------redir+code-------------->|
    |           |                                |  
    |           |<------exchangeForAT(code)------|
    |           |                                |
    |           |-------google:accessToken------>|
    |                                            |//the purpose was only to identify the user
    |                                            |//generate our own accesstoken
    |        mangatrack:accessToken              |                               
    |<-------------------------------------------|                                      

2. authorize & renew

Just send token in headers as per standard

