import { LogEXSession } from './logexSession.js'

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
        callback()
      }
    }.bind(this)
    langFile.send(null)
  }

  string (key, params) {
    const language = LogEXSession.getLanguage()

    if (!Object.prototype.hasOwnProperty.call(this.langDicts, language)) {
      return 'Language file not loaded.'
    }

    const dict = this.langDicts[language]

    if (!Object.prototype.hasOwnProperty.call(dict, key)) {
      return 'Key not found'
    }

    return dict[key]
  }
}

const translateInstance = new Translate()

export function translate (key, params) { return translateInstance.string(key, params) }
export function loadLanguage (language, callback) { return translateInstance.loadLanguage(language, callback) }
