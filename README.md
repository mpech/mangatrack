# Mangatrack

Track one's fav mangas from

- mangakakalot
- fanfox

[live](https://mangatrack.nodekoko.com)

## Getting Started


### Prerequisites

You need

* node.js >= 12
* mongodb >= 3.6
* make to run tests

### Installing

#### api
```
git clone https://github.com/mpech/mangatrack.git
cd mangatrack
npm install
node app.js
```
Api should now be accessible via ```http://127.0.0.1:4020```

#### front

As is, you just need to serve the static folder ```./front``` (e.g with nginx (change the root path))
```
# in /etc/nginx/sites-enabled/mangatrack
server {
    listen 80;
    server_name mangatrack;
    allow 127.0.0.1;
    deny all;
    location / {
        root /pathto/mangatrack/front/;
        try_files $uri $uri/ /index.html;
        expires off;break;
    }
}

# in /etc/hosts
127.0.0.1 mangatrack
```

Site should now be accessible in browser via ```http://mangatrack```


### Populating some data ###
```
(cd process && node refreshProcess.js)
```

## Running the tests

Run all tests
```
npm test
```

Run some test
```
npm test test/e2e/mangas.js
```
or
```
cd test/e2e && npm test mangas.js
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

## Built With

* [express](https://github.com/expressjs/express) - The web framework used
* [mongo](https://www.mongodb.com/) - The db used
* [vue](https://vuejs.org/) - The frontend framework used
* [standard](https://github.com/standard/standard) - code style

## License

This project is licensed under the WTF License - see the [LICENSE.txt](docs/license.txt) file for details


