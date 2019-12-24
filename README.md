# Mangatrack

Track one's fav mangas from

- mangakakalot
- fanfox

[live](https://mangatrack.nodekoko.com)

## Getting Started

Two folders, back and front.

### Prerequisites

You need

* node.js >= 12
* mongodb >= 3.6
* make to run tests

### Installing

#### api
```
git clone https://github.com/mpech/mangatrack.git
cd mangatrack/back
npm install
node app.js
```
Api should now be accessible via ```http://127.0.0.1:4020```

#### front

```
cd front
npm install
npm run serve
```

For more specific instructions, check [back](./back/README.md) and [front](./front/README.md)

## Built With

* [express](https://github.com/expressjs/express) - The web framework used
* [mongo](https://www.mongodb.com/) - The db used
* [vue](https://vuejs.org/) - The frontend framework used
* [standard](https://github.com/standard/standard) - code style

## License

This project is licensed under the WTF License - see the [LICENSE.txt](./license.txt) file for details


