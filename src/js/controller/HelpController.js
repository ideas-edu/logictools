import 'bootstrap'
import 'iframe-resizer'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'katex/dist/katex.min.css'

import { LogEXSession } from '../logEXSession.js'
import { translate, loadLanguage } from '../translate.js'

function ready (fn) {
  if (document.readyState !== 'loading') {
    fn()
  } else {
    document.addEventListener('DOMContentLoaded', fn)
  }
}

function setUp () {
  window.UITranslate = function () {
    const language = LogEXSession.getLanguage()
    const langCallback = function () {
      updateTexts()
    }
    loadLanguage(language, langCallback)
  }
  window.UITranslate()
}

function updateTexts () {
  const elements = document.querySelectorAll('[translate-key]')
  for (const element of elements) {
    element.innerHTML = translate(element.getAttribute('translate-key'))
  }
}

ready(setUp)
