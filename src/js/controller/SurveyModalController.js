import jsrender from 'jsrender'
import Modal from 'bootstrap/js/dist/modal'

import { IdeasServiceProxy } from '../model/ideasServiceProxy'
import { translateChildren } from '../translate.js'

const $ = jsrender(null)

export class SurveyModalController {
  constructor (config, survey) {
    this.config = config
    this.survey = survey
  }

  /**
   * Show the modal
   * @param {String} which The template to show
   * @param {String} where The id of the element to load the modal in
   */
  show (which, where) {
    const tmpl = $.templates('#' + which)
    const html = tmpl.render(this.survey)
    document.getElementById(where).innerHTML += html

    const surveyElement = document.getElementById('survey-modal')
    translateChildren(surveyElement)
    this.modal = new Modal(
      surveyElement, { backdrop: 'static', focus: true, keyboard: true }
    )
    this.initializeBehaviour()
    this.modal.show()
  }

  close () {
    this.modal.dispose()
  }

  initializeBehaviour () {
    document.getElementById('close-modal-btn').addEventListener('click', function () {
      this.close()
    }.bind(this))

    document.getElementById('dismiss-modal-btn').addEventListener('click', function () {
      this.close()
    }.bind(this))

    document.getElementById('ok-modal-btn').addEventListener('click', function () {
      this.logFeedback()
      this.close()
    }.bind(this))
  }

  logFeedback () {
    IdeasServiceProxy.log(this.config, {
      feedback: document.getElementById('difficulty-select').value
    })
  }
}
