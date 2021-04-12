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
    this.getUserId()
    this.supportedLanguages = ['en', 'nl']
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
      Gets the exercisetype as given in the querystring
    */
  getUserId () {
    const sPageURL = window.location.search.substring(1)
    const sURLVariables = sPageURL.split('&')
    let sParameterName
    let i

    for (i = 0; i < sURLVariables.length; i += 1) {
      sParameterName = sURLVariables[i].split('=')
      console.log(sParameterName)
      if (sParameterName[0] === 'userId') {
        console.log(sParameterName[1])
        LogEXSession.setStudentId(sParameterName[1])
        return
      }
    }
  }

  /**
        Initializes the language to the user settings or falls back to the browser language.
     */
  initializeLanguage () {
    let language
    if (LogEXSession.getLanguage() === null || !this.supportedLanguages.includes(LogEXSession.getLanguage())) {
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

    // const helpButton = document.getElementById('help')
    // helpButton.href = `pdf/LogEX_manual_${language}.pdf`
    // helpButton.target = '_new'

    // All iFrames must be updated to new language.
    if (document.getElementById('fra-logeq').getAttribute('src') !== '') {
      document.getElementById('fra-logeq').contentWindow.UITranslate('LOGEQ')
    }
    if (document.getElementById('fra-dnv').getAttribute('src') !== '') {
      document.getElementById('fra-dnv').contentWindow.UITranslate()
    }
    if (document.getElementById('fra-cnv').getAttribute('src') !== '') {
      document.getElementById('fra-cnv').contentWindow.UITranslate()
    }
    if (document.getElementById('fra-help-container').getAttribute('src') !== '') {
      document.getElementById('fra-help-container').contentWindow.UITranslate()
    }
  }

  updateTexts () {
    document.getElementById('tab-logeq').innerHTML = translate('main.tabTitle.logeq')
    document.getElementById('tab-dnv').innerHTML = translate('main.tabTitle.dnf')
    document.getElementById('tab-cnv').innerHTML = translate('main.tabTitle.cnf')
    document.getElementById('tab-help').innerHTML = translate('main.help')
  }
}

function setUp () {
  const mainFrameController = new MainFrameController()

  mainFrameController.initializeLanguage()
  mainFrameController.initializeLabels()

  // Make sure tabs are only loaded when they are clicked for the first time.
  const elements = document.getElementsByClassName('nav-link')
  // elements.push(document.getElementById('tab-help'))

  for (const element of elements) {
    element.addEventListener('click', function (e) {
      const paneID = this.getAttribute('href').replace('#', '')
      const tab = document.getElementById(paneID)
      const src = tab.getAttribute('data-src')
      const frame = document.getElementById(`fra-${paneID}`)

      // if the iframe hasnt already been loaded: load it once
      if (frame.getAttribute('src') === '') {
        frame.setAttribute('src', src)
      }
      // Set focus to iframe so that keydown events are passed to the iframe contents
      frame.contentWindow.focus()
    }.bind(element))
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
