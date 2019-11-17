let routes = {
    mangas: 'http://mangatrackapi/mangas',
    chapters: 'http://mangatrackapi/mangas/{{nameId}}/chapters',
    myMangas: 'http://mangatrackapi/me/mangas/{{nameId}}',
}
let symbols = {
    ALL_READ: -1
}
export {routes, symbols}