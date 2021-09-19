import { html } from 'hybrids'
const handleClick = (host, e) => {
  window.scrollTo({
    top: 0
  })
  e.preventDefault()
}
export default {
  tag: 'MtToTop',
  scrolled: {
    connect: (host) => {
      const options = {
        root: null,
        rootMargin: '0px',
        threshold: 1.0
      }

      const target = host.render()
      const [inPx, outPx] = [...target.querySelectorAll('span')]

      const callback = (entries) => {
        entries.forEach(entry => {
          if (entry.target === inPx) {
            if (entry.isIntersecting) {
              host.scrolled = false
            }
          } else {
            if (entry.isIntersecting) {
              host.scrolled = true
            }
          }
        })
      }
      const observer = new window.IntersectionObserver(callback, options)
      observer.observe(inPx)
      observer.observe(outPx)
      return () => {
        observer.disconnect()
      }
    }
  },
  render: ({ scrolled }) => (html`
<span id="inviewport"></span>
<span id="outviewport"></span>
<a onclick="${handleClick}" class="${scrolled ? 'scrolled' : undefined}" >
  ↑
</a>
  `).style(`
a {
  display: none;
}
a.scrolled {
  position: fixed;
  bottom: 1vh;
  right: 1vh;

  color: var(--a-color, #1976d2);
  cursor: pointer;
  font-size: 2em;

  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  width: 60px;
  height: 60px;
  box-shadow: 0 3px 8px rgb(0 0 0 / 25%);
  background: var(--main-bgcolor);
}
a:link, a:visited {
  text-decoration: none;
}
a:hover {
  color: var(--a-hover-color, var(--a-color, #1976d2));
  box-shadow: 0 5px 10px rgb(0 0 0 / 25%);
}

:host {
  position: absolute;
  top: 0vh;
  right: 0vh;
}
#inviewport {
  top: 100vh;
}
#outviewport {
  position: relative;
  top: calc(100vh + 100px);
}
  `)
}
