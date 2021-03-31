import 'bootstrap'
import { iframeResize } from 'iframe-resizer'
import 'bootstrap/dist/css/bootstrap.min.css'
import '@fontsource/open-sans'
import '@fortawesome/fontawesome-free/js/fontawesome'
import '@fortawesome/fontawesome-free/js/solid'
import '@fortawesome/fontawesome-free/js/regular'
import '@fortawesome/fontawesome-free/js/brands'

import { LogEXSession } from '../logEXSession.js'
import { translate, loadLanguage } from '../translate.js'

function ready (fn) {
  if (document.readyState !== 'loading') {
    fn()
  } else {
    document.addEventListener('DOMContentLoaded', fn)
  }
}

class MainFrameController {
  constructor () {
    document.getElementById('lang-nl').addEventListener('click', function () {
      LogEXSession.setLanguage('nl')
      this.initializeLabels()

      // Switch view of the buttons (Bold = Active)
      document.getElementById('lang-nl').classList.add('active')
      document.getElementById('lang-en').classList.remove('active')
    }.bind(this))

    document.getElementById('lang-en').addEventListener('click', function () {
      LogEXSession.setLanguage('en')
      this.initializeLabels()

      // Switch view of the buttons (Bold = Active)
      document.getElementById('lang-en').classList.add('active')
      document.getElementById('lang-nl').classList.remove('active')
    }.bind(this))
  }

  /**
        Initializes the language to the user settings or falls back to the browser language.
     */
  initializeLanguage () {
    let language
    if (LogEXSession.getLanguage() === null) {
      // Default language = EN overrule with browser language
      language = 'en'
      const browserLanguage = window.navigator.userLanguage || window.navigator.language
      if (browserLanguage.substring(0, 2) === 'nl') {
        language = 'nl'
      }
      LogEXSession.setLanguage(language)
    }
    language = LogEXSession.getLanguage()
    document.getElementById(`lang-${language}`).classList.add('active')
  }

  /**
        Initializes all buttons and label to correct language
     */
  initializeLabels () {
    const language = LogEXSession.getLanguage()
    const langCallback = this.updateTexts
    loadLanguage(language, langCallback)
    document.getElementById(`lang-${language}`).classList.add('active')

    const helpButton = document.getElementById('help')
    helpButton.href = `pdf/LogEX_manual_${language}.pdf`
    helpButton.target = '_new'

    // All iFrames must be updated to English.
    if (document.getElementById('fra-logeq').getAttribute('src') !== '') {
      document.getElementById('fra-logeq').contentWindow.UITranslate('LOGEQ')
    }
    if (document.getElementById('fra-dnv').getAttribute('src') !== '') {
      document.getElementById('fra-dnv').contentWindow.UITranslate()
    }
    if (document.getElementById('fra-cnv').getAttribute('src') !== '') {
      document.getElementById('fra-cnv').contentWindow.UITranslate()
    }
  }

  updateTexts () {
    document.getElementById('tab-logeq').innerHTML = translate('main.tabTitle.logeq')
    document.getElementById('tab-dnv').innerHTML = translate('main.tabTitle.dnf')
    document.getElementById('tab-cnv').innerHTML = translate('main.tabTitle.cnf')
    document.getElementById('help').innerHTML = translate('main.help')
  }
}

function setUp () {
  const mainFrameController = new MainFrameController()

  mainFrameController.initializeLanguage()
  mainFrameController.initializeLabels()

  // Make sure tabs are only loaded when they are clicked for the first time.
  const elements = document.getElementsByClassName('nav-link')

  for (const element of elements) {
    element.addEventListener('click', function (e) {
      const paneID = e.target.getAttribute('href').replace('#', '')
      const tab = document.getElementById(paneID)
      const src = tab.getAttribute('data-src')
      const frame = document.getElementById(`fra-${paneID}`)

      // if the iframe hasnt already been loaded: load it once
      if (frame.getAttribute('src') === '') {
        frame.setAttribute('src', src)
      }
    })
  }

  iframeResize({
    log: false,
    contentWindowBodyMargin: 8,
    doHeight: true,
    doWidth: false,
    interval: 250
  }, 'iframe')
}

ready(setUp)
