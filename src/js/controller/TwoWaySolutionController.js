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
import { TwoWayExerciseSolver } from '../model/twoway/exerciseSolver.js'
import { TwoWayExercise } from '../model/twoway/exercise.js'
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
    const controller = new TwoWaySolutionController()
    controller.solveExercise()
    controller.updateTexts()
  })
}

ready(setUp)

/**
    TwoWayController is responsible for handling all user interaction and manipulation of the user interface.
    @constructor
 */

class TwoWaySolutionController extends LogExSolutionController {
  constructor () {
    super()
    this.exerciseSolver = new TwoWayExerciseSolver(this.config)
    this.ExerciseType = TwoWayExercise
  }

  /**
        Handles the event that an exercise is solved
        @param {TwoWayStepCollection} solution - The solution
     */
  onExerciseSolved (solution) {
    this.exercise = solution

    for (let i = 0; i < solution.topSteps.length; i++) {
      this.insertStep(solution.topSteps[i], false)
    }

    // for (let i = solution.bottomSteps.length - 1; i >= 0; i--) {
    for (let i = 0; i < solution.bottomSteps.length; i++) {
      this.insertStep(solution.bottomSteps[i], false)
    }
    const arrow = katex.renderToString('\\Leftrightarrow', {
      throwOnError: false
    })
    const message = solution.topSteps[0].formulaKatex + ' ' + arrow + ' ' + solution.bottomSteps[0].formulaKatex

    this.updateAlert(message, 'complete')
  }

  renderStep (step) {
    let rule = ''
    let arrow = null
    if (step.rule !== undefined) {
      rule = translate(Rules[step.rule])
    }

    const stepTemplate = $.templates('#exercise-step-template')

    if (step.number > 1 || step.isBottomStep) {
      arrow = katex.renderToString('\\Leftrightarrow', {
        throwOnError: false
      })
    }

    const exerciseStepHtml = stepTemplate.render({
      rule: rule,
      formula: step.formulaKatex,
      basis: step === this.exercise.topSteps[0] || step === this.exercise.bottomSteps[0],
      topStep: step.isTopStep,
      bottomStep: step.isBottomStep,
      arrow: arrow
    })
    return exerciseStepHtml
  }
}
