/* global document, window, TwoWaySolutionController, TwoWayStep, jQuery, LogEXSession, Resources, $, KeyBindings, Rules, setTimeout, TwoWayExerciseGenerator, Equation, TwoWayExercise, TwoWayExerciseSolver, TwoWayExerciseValidator, SyntaxValidator */

// import { BTN_OK, BTN_SHOW_NEXT_STEP, BTN_SHOWDERIVATION, BTN_DERIVATIONDONE, BTN_NEWEXERCISE, BTN_GENERATEEXERCISENORMAL, BTN_LOGOUT, SWITCH_RULE, VAL_SETONLABEL, VALSETOFFLABEL, LBL_RULEJUSTIFICATION, SWITCH_VALIDATION, LBL_STEPVALIDATION, BTN_SHOWHINT, BTN_SOLVEEXERCISE, BTN_VALIDATESTEP } from '../constants.js'
// import { config } from '../config.js'
import { LogEXSession } from '../logEXSession.js'
import { Resources } from '../resources.js'
// import { KeyBindings } from '../keyBindings.js'
// import { OneWayExerciseGenerator } from '../model/oneway/exerciseGenerator.js'
// import { OneWayExerciseCreator } from '../model/oneway/exerciseCreator.js'
import { TwoWayExerciseSolver } from '../model/twoway/exerciseSolver.js'
// import { OneWayExerciseValidator } from '../model/oneway/exerciseValidator.js'
// import { OneWayStep } from '../model/oneway/step.js'
import { TwoWayExercise } from '../model/twoway/exercise.js'
// import { SyntaxValidator } from '../model/syntaxValidator.js'
// import { Rules } from '../model/rules.js'
// import { IdeasServiceProxy } from '../model/ideasServiceProxy.js'

(function ($) {
  'use strict'

  // we can now rely on $ within the safety of our "bodyguard" function
  $(document).ready(function () {
    const controller = new TwoWaySolutionController()
    controller.solveExercise()
  })
})(jQuery)

/**
    TwoWayController is responsible for handling all user interaction and manipulation of the user interface.
    @constructor
 */

function TwoWaySolutionController () {
  'use strict'

  const self = this

  const EXERCISE_TYPE = 'exerciseType'
  const START = 'START'
  const EXERCISE_ADDED_STEP = '.exercise-step-added'
  const EXERCISE_BOTTOM_STEPS = '#exercise-steps div.exercise-step-added-bottom'
  const EXERCISE_TOP_STEPS = '#exercise-steps div.exercise-step-added-top'
  const EXERCISE_LAST_STEP = '#exercise-steps div.last-step'
  const NEW_EXERCISE_CONTENT = '#new-exercise-content'

  const UNDEFINED = 'undefined'
  const TOP = 'top'
  const ERROR = 'error'
  const SUCCESS = 'success'
  const DIV_TOOLTIP_ERROR = "<div class='tooltip error'><div class='tooltip-arrow'></div><div class='tooltip-inner'></div></div>"
  const SHOW = 'show'
  const DESTROY = 'destroy'
  const ERROR_TIMEOUT = 5000

  /**
        Gets the exercisetype as given in the querystring
    */
  this.getExerciseType = function () {
    const sPageURL = window.location.search.substring(1)
    const sURLVariables = sPageURL.split('&')
    let sParameterName
    let i

    for (i = 0; i < sURLVariables.length; i += 1) {
      sParameterName = sURLVariables[i].split('=')
      if (sParameterName[0] === 'exerciseType') {
        return sParameterName[1]
      }
    }
  }

  /**
        Gets the formula as given in the querystring
    */
  this.getFormula = function () {
    const sPageURL = window.location.search.substring(1)
    const sURLVariables = sPageURL.split('&')
    let sParameterName
    let i
    for (i = 0; i < sURLVariables.length; i += 1) {
      sParameterName = sURLVariables[i].split('=')
      if (sParameterName[0] === 'formula') {
        return decodeURIComponent(sParameterName[1] + '==' + sParameterName[3])
      }
    }
  }

  /**
        Shows an error message.

        @param element - The DOM element
        @param {string} toolTipText - The error message
        @param {string} placement - The placement of the error message (top | bottom | left | right)
     */
  this.showErrorToolTip = function (element, toolTipText, placement) {
    if (typeof placement === UNDEFINED) {
      placement = TOP
    }
    element.addClass(ERROR)
    element.tooltip({
      title: toolTipText,
      placement: placement,
      template: DIV_TOOLTIP_ERROR
    })
    element.tooltip(SHOW)

    // vervelende tooltips verwijderen na 5 seconden, dan hebben gebruikers ze wel gezien
    setTimeout(this.clearErrors, ERROR_TIMEOUT)
  }

  /**
        Zebra stripes the proof steps.

        @param rows - The proof step rows
     */
  this.colorRows = function (rows) {
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

  // exercise solving
  this.exerciseSolver = new TwoWayExerciseSolver()

  /**
        Solves the exercise
     */
  this.solveExercise = function () {
    const exerciseType = this.getExerciseType()
    const formula = this.getFormula()
    let exercise

    exercise = new TwoWayExercise(formula, exerciseType, false)
    this.exerciseSolver.solve(exercise, this.onExerciseSolved, this.onErrorSolvingExercise)
  }

  /**
        Handles the event that an exercise is solved
        @param {TwoWayStepCollection} solution - The solution
     */
  this.onExerciseSolved = function (solution) {
    let lastStep = null

    $('#exercise-left-formula').text(solution.steps[0].equation.formula1)
    $('#exercise-right-formula').text(solution.steps[0].equation.formula2)

    jQuery.each(solution.steps, function (index) {
      lastStep = this
      self.insertStep(this, false)
    })
    if (lastStep) {
      self.insertLastStep(lastStep)
    }
    self.colorRows()
  }

  /**
        Handles the error that an exercise can not be solved
     */
  this.onErrorSolvingExercise = function () {
    self.showErrorToolTip($(BTN_SOLVEEXERCISE), Resources.getSpecificMessage(LogEXSession.getLanguage(), 'error-solving-exercise'), 'right')
  }

  /**
        Inserts a proof step

        @param {TwoWayStep} step - The proof step
        @param {Boolean} canDelete - True if the proof step can be deleted, false otherwise
     */
  this.insertStep = function (step, canDelete) {
    const exerciseStepHtml = self.renderStep(step, canDelete)

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
  this.insertLastStep = function (step) {
    const stepTemplate = $('#exercise-last-step-template')
    const exerciseStepHtml = stepTemplate.render({
      leftformula: step.equation.formula1,
      rightformula: step.equation.formula2
    })

    $('#active-step').before(exerciseStepHtml)
  }

  this.renderStep = function (step) {
    const rule = Resources.getRule(LogEXSession.getLanguage(), step.rule)
    let stepTemplate
    let exerciseStepHtml
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

    exerciseStepHtml = stepTemplate.render({
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
