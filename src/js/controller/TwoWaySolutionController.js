import $ from 'jquery'
import jsrender from 'jsrender'

import { LogExSolutionController } from './LogExSolutionController.js'
import { LogEXSession } from '../logEXSession.js'
import { Resources } from '../resources.js'
import { TwoWayExerciseSolver } from '../model/twoway/exerciseSolver.js'
import { TwoWayExercise } from '../model/twoway/exercise.js'

jsrender($); // load JsRender jQuery plugin methods

(function () {
  $(document).ready(function () {
    const controller = new TwoWaySolutionController()
    controller.solveExercise()
  })
})()

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
      Gets the formula as given in the querystring
  */
  getFormula () {
    const sPageURL = window.location.search.substring(1)
    const sURLVariables = sPageURL.split('&')

    for (const i in sURLVariables) {
      const sParameterName = sURLVariables[i].split('=')
      if (sParameterName[0] === 'formula') {
        return decodeURIComponent(sParameterName[1] + '==' + sParameterName[3])
      }
    }
  }

  /**
        Zebra stripes the proof steps.

        @param rows - The proof step rows
     */
  colorRows (rows) {
    if (rows === undefined) {
      this.colorRows($('.exercise-step-added-top'))
      this.colorRows($($('.exercise-step-added-bottom').get().reverse()))

      return
    }

    let toggle = -1

    rows.each(function () {
      if (toggle < 0) {
        $(this).addClass('oneven')
      } else {
        $(this).removeClass('oneven')
      }
      toggle = toggle * -1
    })
  }

  /**
        Handles the event that an exercise is solved
        @param {TwoWayStepCollection} solution - The solution
     */
  onExerciseSolved (solution) {
    let lastStep = null

    $('#exercise-left-formula').text(solution.steps[0].equation.formula1)
    $('#exercise-right-formula').text(solution.steps[0].equation.formula2)

    solution.steps.forEach(function (item) {
      lastStep = item
      this.insertStep(item, false)
    }.bind(this))
    if (lastStep) {
      this.insertLastStep(lastStep)
    }
    this.colorRows()
  }

  /**
        Inserts a proof step

        @param {TwoWayStep} step - The proof step
        @param {Boolean} canDelete - True if the proof step can be deleted, false otherwise
     */
  insertStep (step, canDelete) {
    const exerciseStepHtml = this.renderStep(step, canDelete)

    if (step.isTopStep) {
      $('#active-step').before(exerciseStepHtml)
    } else {
      $('#active-step').after(exerciseStepHtml)
    }
  }

  /**
        Inserts the last proof step

        @param {TwoWayStep} step - The proof step
     */
  insertLastStep (step) {
    const stepTemplate = $('#exercise-last-step-template')
    const exerciseStepHtml = stepTemplate.render({
      leftformula: step.equation.formula1,
      rightformula: step.equation.formula2
    })

    $('#active-step').before(exerciseStepHtml)
  }

  renderStep (step) {
    const rule = Resources.getRule(LogEXSession.getLanguage(), step.rule)
    let stepTemplate
    let error

    // dit is de start opgave
    if (!step.isTopStep && !step.isBottomStep) {
      return ''
    }

    if (step.isTopStep) {
      stepTemplate = $('#exercise-top-step-template')
    } else {
      stepTemplate = $('#exercise-bottom-step-template')
    }

    const exerciseStepHtml = stepTemplate.render({
      error: error,
      rule: rule,
      leftformula: step.equation.formula1,
      rightformula: step.equation.formula2,
      canDelete: false,
      isWrong: false,
      hasRule: this.rule !== undefined,
      step: 1,
      stepValidation: true
    })
    return exerciseStepHtml
  }
}
