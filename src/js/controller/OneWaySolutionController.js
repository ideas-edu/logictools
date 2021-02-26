import $ from 'jquery'
import jsrender from 'jsrender'
import 'katex/dist/katex.min.css'

import { LogExSolutionController } from './LogExSolutionController.js'
import { LogEXSession } from '../logEXSession.js'
import { Resources } from '../resources.js'
import { OneWayExerciseSolver } from '../model/oneway/exerciseSolver.js'
import { OneWayExercise } from '../model/oneway/exercise.js'

jsrender($); // load JsRender jQuery plugin methods

(function () {
  $(document).ready(function () {
    const controller = new OneWaySolutionController()
    controller.solveExercise()
  })
})()

/**
    OneWayController is responsible for handling all user interaction and manipulation of the user interface.
    @constructor
 */

class OneWaySolutionController extends LogExSolutionController {
  constructor () {
    super()
    this.exerciseSolver = new OneWayExerciseSolver()
    this.ExerciseType = OneWayExercise
  }

  /**
        Zebra stripes the proof steps.

        @param rows - The proof step rows
     */
  colorRows (rows) {
    let toggle = -1

    if (rows === undefined) {
      this.colorRows($('.exercise-step-added'))
      return
    }

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
        @param {ProofStepCollection} solution - The solution
     */
  onExerciseSolved (solution) {
    let lastStep = null
    let firstStep = null

    document.getElementById('exercise-left-formula').innerHTML = solution.steps[0].formulaKatex
    firstStep = solution.steps[0]
    solution.steps.forEach(function (item) {
      lastStep = item
      this.insertStep(item, false)
    }.bind(this))
    if (lastStep) {
      this.insertLastStep(firstStep, lastStep)
    }
    this.colorRows()
  }

  /**
        Inserts a proof step

        @param {ProofStep} step - The proof step
        @param {Boolean} canDelete - True if the proof step can be deleted, false otherwise
     */
  insertStep (step, canDelete) {
    const exerciseStepHtml = this.renderStep(step, canDelete)
    if (exerciseStepHtml === undefined) {
      return
    }
    const exerciseStep = document.createElement('div')
    exerciseStep.innerHTML = exerciseStepHtml
    document.getElementById('active-step').insertAdjacentElement('beforebegin', exerciseStep)
  }

  renderStep (step, canDelete) {
    let rule = ''
    const stepTemplate = $('#exercise-step-template')
    const error = ''

    if (step.rule === null) { // dit is de startopgave
      return
    }

    if (step.rule !== '') {
      rule = Resources.getRule(LogEXSession.getLanguage(), step.rule)
    }

    const exerciseStepHtml = stepTemplate.render({
      error: error,
      rule: rule,
      formula: step.formulaKatex,
      isWrong: false,
      hasRule: true,
      canDelete: canDelete,
      step: 1,
      stepValidation: true
    })
    return exerciseStepHtml
  }

  /**
        Inserts the last proof step

        @param {ProofStep} step - The proof step
     */
  insertLastStep (firstStep, lastStep) {
    const stepTemplate = $('#exercise-last-step-template')
    const exerciseStepHtml = stepTemplate.render({
      leftformula: firstStep.formulaKatex,
      rightformula: lastStep.formulaKatex
    })

    $('#active-step').before(exerciseStepHtml)
  }
}
