# Mangatrack

Track one's fav mangas from

- mangakakalot
- fanfox
- manganelo

[live](https://mangatrack.nodekoko.com)

## Getting Started

Two folders, back and front.

### Prerequisites

You need

* node.js >= 16
* mongodb >= 4.4.8
* pnpm >= 6.32

### Installing

#### api
```
git clone https://github.com/mpech/mangatrack.git
cd mangatrack/back
pnpm install
pnpm start
```
Api should now be accessible via ```http://127.0.0.1:4020```

#### front

```
cd front
pnpm install
pnpm run start
```

For more specific instructions, check [back](./back/README.md) and [front](./front/README.md)

## Built With

* [express](https://github.com/expressjs/express)
* [mongo](https://www.mongodb.com/)
* [hybrids](https://hybrids.js.org)
* [vite](https://vitejs.dev/)
* [standard](https://github.com/standard/standard)

## License

This project is licensed under the WTF License - see the [LICENSE.txt](./license.txt) file for details


