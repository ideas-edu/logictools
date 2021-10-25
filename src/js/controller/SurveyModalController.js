import jsrender from 'jsrender'

import { IdeasServiceProxy } from '../model/ideasServiceProxy'
import { translateChildren } from '../translate'
import { ExerciseTypes } from '../model/exerciseTypes'

const $ = jsrender(null)

export class SurveyModalController {
  constructor (exerciseController, survey) {
    this.config = exerciseController.config
    this.exerciseController = exerciseController
    this.exerciseId = ExerciseTypes[exerciseController.exerciseType]
    this.survey = survey
  }

  /**
   * Show the modal
   * @param {String} which The template to show
   * @param {Element} where The element to load the modal in
   */
  show (which, where) {
    this.where = where
    const tmpl = $.templates('#' + which)
    const html = tmpl.render(this.survey)
    this.where.innerHTML = html
    this.where.style.display = ''

    translateChildren(where)
    this.initializeBehaviour()
  }

  close () {
    this.where.innerHTML = ''
  }

  initializeBehaviour () {
    document.getElementById('feedback-submit-btn').addEventListener('click', function () {
      this.logFeedback()
      this.close()
    }.bind(this))
  }

  logFeedback () {
    const state = {
      exerciseid: this.exerciseId,
      feedback: document.getElementById('difficulty-select').value
    }
    IdeasServiceProxy.log(this.config, state)
  }
}
