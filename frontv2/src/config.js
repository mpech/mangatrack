export const apiHost = (window.location.host.includes('.com'))
  ? 'https://mangatrackapi.nodekoko.com'
  : `http://${window.location.host.replace(/:.*$/g, '')}:4020`