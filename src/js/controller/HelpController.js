import 'bootstrap'
import 'iframe-resizer'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'katex/dist/katex.min.css'

window.translate = () => {
  // do nothing, all translation is done by the updateTexts function in mainFrameController.js
}

function ready (fn) {
  if (document.readyState !== 'loading') {
    fn()
  } else {
    document.addEventListener('DOMContentLoaded', fn)
  }
}

function setUp () {
  setTimeout(function () {
    document.querySelectorAll('video').forEach(item => {
      if (item.getAttribute('_src') !== '') {
        const sourceMp4 = document.createElement('source')
        sourceMp4.setAttribute('src', `${item.getAttribute('_src')}.mp4`)
        item.appendChild(sourceMp4)
        const sourceWebm = document.createElement('source')
        sourceWebm.setAttribute('src', `${item.getAttribute('_src')}.webm`)
        item.appendChild(sourceWebm)
        item.load()
      }
    })
  }, 1000)
}

ready(setUp)
