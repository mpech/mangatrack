### Populating some data ###
```
(cd process && node refreshProcess.js)
```

## Running the tests

Run all tests
```
pnpm test
```

Run some test
```
pnpm test test/e2e/mangas.js --watch --parallel
```
or
```
cd test/e2e && pnpm test mangas.js
```

## Deployment

You may want to change some config properties from the backend

Create ```privateConfig.json``` alongside ```./config/index.js``` and override some keys.

e.g: ```./config/privateConfig.json```:
```
{
    "oauth2_facebook_secret":"xxx",
    "oauth2_google_secret":"xxx",
    "log_lvl":"prd",
    "oauth2_google_redirect_uri": "xxx",
    "oauth2_facebook_redirect_uri": "xxx"
}

```