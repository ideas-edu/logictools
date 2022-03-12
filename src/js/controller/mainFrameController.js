import 'bootstrap'
import { iframeResize } from 'iframe-resizer'
import 'bootstrap/dist/css/bootstrap.min.css'
import '@fontsource/open-sans'
import '@fortawesome/fontawesome-free/js/fontawesome'
import '@fortawesome/fontawesome-free/js/solid'
import '@fortawesome/fontawesome-free/js/regular'
import '@fortawesome/fontawesome-free/js/brands'
import config from '../../../config.json'

import { LogEXSession } from '../logEXSession.js'
import { translateChildren, loadLanguage } from '../translate.js'

import { Modal } from 'bootstrap'

function ready (fn) {
  if (document.readyState !== 'loading') {
    fn()
  } else {
    document.addEventListener('DOMContentLoaded', fn)
  }
}

class MainFrameController {
  constructor () {
    document.getElementById('header-title').innerHTML = config.title
    document.getElementById('page-title').innerHTML = config.title

    // start Login
    document.getElementById('userid').value = LogEXSession.getStudentId() 
    var myModal = new Modal(document.getElementById('loginModal'))
    myModal.show()

    document.getElementById('button-login').addEventListener('click', function () {
      let userid = document.getElementById('userid').value
      if (userid.length >= 13) {
          LogEXSession.setStudentId(userid, config.tools) 
          myModal.hide()
      }
    }.bind(this))

    //this.getUserId() 
    // Eind Login

    this.supportedLanguages = ['en', 'nl']
    document.getElementById('lang-nl').addEventListener('click', function () {
      LogEXSession.setLanguage('nl')
      this.initializeLabels(false)

      // Switch view of the buttons (Bold = Active)
      document.getElementById('lang-nl').classList.add('active')
      document.getElementById('lang-en').classList.remove('active')
    }.bind(this))

    document.getElementById('lang-en').addEventListener('click', function () {
      LogEXSession.setLanguage('en')
      this.initializeLabels(false)

      // Switch view of the buttons (Bold = Active)
      document.getElementById('lang-en').classList.add('active')
      document.getElementById('lang-nl').classList.remove('active')
    }.bind(this))

    // Set up tools/help menu chosen in config
    for (const tool of Object.values(config.tools)) {
      const tabItem = document.createElement('li')

      if (!tool.hidden) {
        tabItem.classList = ['nav-item']
        tabItem.innerHTML = `<a class="nav-link" data-toggle="tab" href="#container-${tool.code}" tool-code="${tool.code}" id="tab-${tool.code}" translate-key="main.tabTitle.${tool.code}"></a>`
        document.getElementById('myTabs').appendChild(tabItem)
      }

      const containerItem = document.createElement('div')
      containerItem.setAttribute('id', `container-${tool.code}`)
      containerItem.classList = ['tab-pane']
      containerItem.setAttribute('data-src', tool.url)
      containerItem.innerHTML = `<iframe src="" seamless frameBorder="0" id="fra-${tool.code}" width="100%" scrolling="no"></iframe>`
      document.getElementById('tab-container').appendChild(containerItem)

      document.getElementById(`fra-${tool.code}`).onload = () => { translateChildren(document.getElementById(`fra-${tool.code}`).contentWindow.document) }
    }
  }

  /**
      Gets the exercisetype as given in the querystring
    */
  getUserId () {
    const sPageURL = window.location.search
    const urlParams = new URLSearchParams(sPageURL)

    for (const entry of urlParams.entries()) {
      if (entry[0].toLowerCase() === 'userid') {
        LogEXSession.setStudentId(entry[1], config.tools)
        return
      }
    }
  }

  /**
      Directly navigate to tool if specified in url
    */
  autoRedirect () {
    const sPageURL = window.location.search
    const urlParams = new URLSearchParams(sPageURL)
    let tool = null
    for (const entry of urlParams.entries()) {
      if (entry[0].toLowerCase() === 'tool') {
        tool = Object.values(config.tools).find(t => t.code.toLowerCase() === entry[1].toLowerCase())
        document.getElementById(`tab-${tool.code}`).classList.add('active')
        document.getElementById(`container-${tool.code}`).classList.add('active')
        selectTool(tool.code, tool.url)
        break
      }
    }
    if (tool === null) {
      document.getElementById('container-welcome').classList.add('active')
      selectTool('welcome', 'welcome.html')
      console.log('hello')
      return
    }
    for (const entry of urlParams.entries()) {
      if (entry[0].toLowerCase() === 'exercise') {
        this.loadExercise(tool, Number(entry[1]))
        return
      }
    }
  }

  loadExercise (tool, exercise) {
    const contentWindow = document.getElementById(`fra-${tool.code}`).contentWindow
    if (contentWindow !== null) {
      const controller = contentWindow.controller
      if (controller !== null && controller !== undefined) {
        controller.useExercise({
          exerciseNumber: exercise,
          displayNumber: exercise + 1
        })
        return
      }
    }

    // The exercise controller is not loaded, wait 100ms and try again
    window.setTimeout(function () {
      this.loadExercise(tool, exercise)
    }.bind(this), 100)
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
  initializeLabels (autoRedirect) {
    const language = LogEXSession.getLanguage()
    const langCallback = () => {
      translateChildren(document)
      document.querySelectorAll('iframe').forEach(item => {
        if (item.getAttribute('src') !== '') {
          item.contentWindow.translate(LogEXSession.getLanguage())
        }
        translateChildren(item.contentWindow.document)
      })
      if (autoRedirect) {
        this.autoRedirect()
      }
    }
    loadLanguage(language, langCallback)
    document.getElementById(`lang-${language}`).classList.add('active')
  }
}

function selectTool (code, url) {
  const frame = document.getElementById(`fra-${code}`)

  // if the iframe hasnt already been loaded: load it once
  if (frame.getAttribute('src') === '') {
    frame.setAttribute('src', url)
  }
  // Set focus to iframe so that keydown events are passed to the iframe contents
  frame.contentWindow.focus()
}

function setUp () {
  const mainFrameController = new MainFrameController()

  mainFrameController.initializeLanguage()
  mainFrameController.initializeLabels(true)

  // Make sure tabs are only loaded when they are clicked for the first time.
  const elements = document.getElementsByClassName('nav-link')

  for (const element of elements) {
    element.addEventListener('click', function (e) {
      const toolCode = this.getAttribute('tool-code')
      const paneID = this.getAttribute('href').replace('#', '')
      const tab = document.getElementById(paneID)
      const src = tab.getAttribute('data-src')

      selectTool(toolCode, src)
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
