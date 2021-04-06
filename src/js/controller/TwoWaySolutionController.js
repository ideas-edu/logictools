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
    document.getElementById('header-formula').innerHTML = translate('shared.header.formula')
    document.getElementById('header-rule').innerHTML = translate('shared.header.rule')
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
    this.exerciseSolver = new TwoWayExerciseSolver()
    this.ExerciseType = TwoWayExercise
  }

  /**
        Handles the event that an exercise is solved
        @param {TwoWayStepCollection} solution - The solution
     */
  onExerciseSolved (solution) {
    this.exercise = solution

    solution.topSteps.forEach(function (item) {
      this.insertStep(item, false)
    }.bind(this))

    for (let i = solution.bottomSteps.length - 1; i >= 0; i--) {
      this.insertStep(solution.bottomSteps[i], false)
    }
    const arrow = katex.renderToString('\\Leftrightarrow', {
      throwOnError: false
    })
    const message = solution.topSteps[0].formulaKatex + ' ' + arrow + ' ' + solution.bottomSteps[0].formulaKatex

    this.updateAlert(message, 'complete')
  }

  /**
        Inserts a proof step

        @param {TwoWayStep} step - The proof step
        @param {Boolean} canDelete - True if the proof step can be deleted, false otherwise
     */
  // insertStep (step, canDelete) {
  //   const exerciseStepHtml = this.renderStep(step, canDelete)

  //   if (step.isTopStep) {
  //     $('#active-step').before(exerciseStepHtml)
  //   } else {
  //     $('#active-step').after(exerciseStepHtml)
  //   }
  // }

  // *
  //       Inserts the last proof step

  //       @param {TwoWayStep} step - The proof step

  // insertLastStep (step) {
  //   const stepTemplate = $('#exercise-last-step-template')
  //   const exerciseStepHtml = stepTemplate.render({
  //     leftformula: step.equation.formula1katex,
  //     rightformula: step.equation.formula2katex
  //   })

  //   $('#active-step').before(exerciseStepHtml)
  // }

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
