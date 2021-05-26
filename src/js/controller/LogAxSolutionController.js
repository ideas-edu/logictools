import katex from 'katex'
import jsrender from 'jsrender'
import 'katex/dist/katex.min.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import '@fortawesome/fontawesome-free/js/fontawesome'
import '@fortawesome/fontawesome-free/js/solid'
import '@fortawesome/fontawesome-free/js/regular'
import '@fortawesome/fontawesome-free/js/brands'

import { SolutionController } from './SolutionController.js'
import { LogEXSession } from '../logEXSession.js'
import { LogAxExerciseSolver } from '../model/logax/exerciseSolver.js'
import { LogAxExercise } from '../model/logax/exercise.js'
import { translate, loadLanguage } from '../translate.js'

const $ = jsrender(null)

function ready (fn) {
  if (document.readyState !== 'loading') {
    fn()
  } else {
    document.addEventListener('DOMContentLoaded', fn)
  }
}

function setUp () {
  const language = LogEXSession.getLanguage()
  loadLanguage(language, function () {
    const controller = new LogAxSolutionController()
    controller.solveExercise()
    controller.updateTexts()
  })
}

ready(setUp)

/**
    LogAxController is responsible for handling all user interaction and manipulation of the user interface.
    @constructor
 */

class LogAxSolutionController extends SolutionController {
  constructor () {
    super()
    this.exerciseSolver = new LogAxExerciseSolver(this.config)
    this.ExerciseType = LogAxExercise
  }

  /**
        Handles the event that an exercise is solved
        @param {ProofStepCollection} solution - The solution
     */
  onExerciseSolved (solution) {
    for (const step of solution.steps) {
      this.insertStep(step, false)
    }
  }

  /**
        Solves the exercise
     */
  solveExercise () {
    const term = [{
      term: this.getFormula(),
      number: 1000
    }]

    const exercise = new this.ExerciseType(term, this.exerciseType, false, false)
    this.exerciseSolver.solve(exercise, this.onExerciseSolved.bind(this), this.onErrorSolvingExercise.bind(this))
  }

  renderStep (step, canDelete) {
    let rule = ''
    const stepTemplate = $.templates('#exercise-step-template')

    if (step.ruleKey !== undefined) {
      rule = translate(step.ruleKey)
    }

    const exerciseStepHtml = stepTemplate.render({
      rule: rule,
      ruleKey: step.ruleKey,
      term: step.termKatex,
      step: step.number,
      references: step.getReferences()
    })

    return exerciseStepHtml
  }

  updateAlert (innerHTML, type) {
    document.getElementById('exercise-alert-container').style.display = ''
    switch (type) {
      case 'hint':
        document.getElementById('exercise-alert-icon').innerHTML = '<i class="fas fa-lg fa-info-circle"></i>'
        document.getElementById('exercise-alert').classList = 'alert col-md-12 hint-alert'
        break
      case 'error':
        document.getElementById('exercise-alert-icon').innerHTML = '<i class="fas fa-lg fa-exclamation-circle"></i>'
        document.getElementById('exercise-alert').classList = 'alert col-md-12 error-alert'
        break
      case 'complete':
        document.getElementById('exercise-alert-icon').innerHTML = '<i class="fas fa-lg fa-check-circle"></i>'
        document.getElementById('exercise-alert').classList = 'alert col-md-12 complete-alert'
        break
    }
    document.getElementById('exercise-alert-span').innerHTML = innerHTML
  }
}
