import katex from 'katex'
import jsrender from 'jsrender'
import 'katex/dist/katex.min.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import '@fortawesome/fontawesome-free/js/fontawesome'
import '@fortawesome/fontawesome-free/js/solid'
import '@fortawesome/fontawesome-free/js/regular'
import '@fortawesome/fontawesome-free/js/brands'

import { LogExSolutionController } from './LogExSolutionController.js'
import { LogEXSession } from '../logEXSession.js'
import { Rules } from '../model/rules.js'
import { OneWayExerciseSolver } from '../model/oneway/exerciseSolver.js'
import { OneWayExercise } from '../model/oneway/exercise.js'
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
    const controller = new OneWaySolutionController()
    controller.solveExercise()
    controller.updateTexts()
  })
}

ready(setUp)

/**
    OneWayController is responsible for handling all user interaction and manipulation of the user interface.
    @constructor
 */

class OneWaySolutionController extends LogExSolutionController {
  constructor () {
    super()
    this.exerciseSolver = new OneWayExerciseSolver(this.config)
    this.ExerciseType = OneWayExercise
  }

  /**
        Handles the event that an exercise is solved
        @param {ProofStepCollection} solution - The solution
     */
  onExerciseSolved (solution) {
    let lastStep = null
    let firstStep = null

    firstStep = solution.steps[0]
    solution.steps.forEach(function (item) {
      lastStep = item
      this.insertStep(item, false)
    }.bind(this))
    if (lastStep) {
      this.insertLastStep(firstStep, lastStep)
    }
  }

  renderStep (step, canDelete) {
    let rule = ''
    let arrow = null
    const stepTemplate = $.templates('#exercise-step-template')

    if (step.rule !== null) {
      rule = translate(Rules[step.rule])
    }

    if (step.number > 1) {
      arrow = katex.renderToString('\\Leftrightarrow', {
        throwOnError: false
      })
    }

    const exerciseStepHtml = stepTemplate.render({
      rule: rule,
      formula: step.formulaKatex,
      canDelete: canDelete,
      step: step.number,
      arrow: arrow,
      stepValidation: true,
      ruleJustification: true
    })
    return exerciseStepHtml
  }

  /**
        Inserts the last proof step

        @param {ProofStep} step - The proof step
     */
  insertLastStep (firstStep, lastStep) {
    const arrow = katex.renderToString('\\Leftrightarrow', {
      throwOnError: false
    })
    const message = firstStep.formulaKatex + ' ' + arrow + ' ' + lastStep.formulaKatex

    this.updateAlert(message, 'complete')
  }
}
