import katex from 'katex'

import { LogEXSession } from './logEXSession.js'

class Translate {
  constructor () {
    this.langDicts = {}
  }

  loadLanguage (language, callback) {
    const langFile = new XMLHttpRequest()
    langFile.overrideMimeType('application/json')
    langFile.open('GET', 'lang/' + language + '.json', true)
    langFile.onreadystatechange = function () {
      if (langFile.readyState === 4 && langFile.status === 200) {
        this.langDicts[language] = JSON.parse(langFile.response)
        if (callback !== undefined) {
          callback()
        }
      }
    }.bind(this)
    langFile.send(null)
  }

  // Takes a path 'nested.key' and return the object found at dict['nested']['key']
  resolveString (path, dict) {
    const properties = Array.isArray(path) ? path : path.split('.')
    return properties.reduce((prev, curr) => prev && prev[curr], dict)
  }

  hasTranslation (key) {
    const language = LogEXSession.getLanguage()
    const dict = this.langDicts[language]

    const string = this.resolveString(key, dict)
    if (string === undefined) {
      return false
    }

    // key.nested resolves to key.nested.#
    if (string.constructor === Object && string['#'] === undefined) {
      return false
    }
    return true
  }

  string (key, params) {
    const language = LogEXSession.getLanguage()

    if (!Object.prototype.hasOwnProperty.call(this.langDicts, language)) {
      return 'Language file not loaded.'
    }

    const dict = this.langDicts[language]

    let string = this.resolveString(key, dict)
    if (string === undefined) {
      return key
    }

    // key.nested resolves to key.nested.#
    if (string.constructor === Object) {
      if (string['#'] !== undefined) {
        string = string['#']
      } else {
        return key
      }
    }

    // Find all cases of {{param}}.
    const paramRegex = /\{\{([^{]*?)\}\}/g

    string = string.replace(paramRegex, function (match, token) {
      return params[token]
    })

    // Find all cases of [[param]]. param will get translate using the key given
    const paramKeyRegex = /\[\[(.*?)\]\]/g

    string = string.replace(paramKeyRegex, function (match, token) {
      if (typeof params[token] === 'string') {
        return this.string(params[token])
      }
      return this.string(params[token].key, params[token].params)
    }.bind(this))

    // Find all cases of $$param$$. param will get rendered using KaTeX
    const paramKatexRegex = /\$\$(.*?)\$\$/g

    string = string.replace(paramKatexRegex, function (match, token) {
      return katex.renderToString(token, {
        throwOnError: false
      })
    })

    return string
  }
}

const translateInstance = new Translate()

export function translate (key, params) { return translateInstance.string(key, params) }
export function hasTranslation (key) { return translateInstance.hasTranslation(key) }
export function translateElement (element, key, params) {
  if (key !== undefined) {
    element.setAttribute('translate-key', key)
  }
  if (params !== undefined) {
    element.setAttribute('translate-params', JSON.stringify(params))
  }
  element.innerHTML = translate(element.getAttribute('translate-key'), JSON.parse(element.getAttribute('translate-params')))
}
// Updates text of all descendant elements of element with translate-key attribute
export function translateChildren (element) {
  const elements = element.querySelectorAll('[translate-key]')
  for (const element of elements) {
    translateElement(element)
  }
}
export function loadLanguage (language, callback) { return translateInstance.loadLanguage(language, callback) }
