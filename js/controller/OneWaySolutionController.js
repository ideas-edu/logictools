/* global document, OneWaySolutionController, OneWayStep, OneWayExercise, OneWayExerciseSolver, OneWayExerciseValidator, SyntaxValidator, jQuery, LogEXSession, $, Resources, KeyBindings, Rules, setTimeout, OneWayExerciseGenerator, formula, window */
(function ($) {
  'use strict'

  // we can now rely on $ within the safety of our "bodyguard" function
  $(document).ready(function () {
    const controller = new OneWaySolutionController()
    controller.solveExercise()
  })
})(jQuery)

/**
    OneWayController is responsible for handling all user interaction and manipulation of the user interface.
    @constructor
 */

function OneWaySolutionController () {
  'use strict'

  const self = this

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
        return decodeURIComponent(sParameterName[1])
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
    // if (typeof placement === "undefined") {
    if (placement === 'undefined') {
      placement = 'top'
    }
    element.addClass('error')
    element.tooltip({
      title: toolTipText,
      placement: placement,
      template: '<div class="tooltip error"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>'
    })
    element.tooltip('show')

    // vervelende tooltips verwijderen na 5 seconden, dan hebben gebruikers ze wel gezien
    setTimeout(this.clearErrors, 5000)
  }

  /**
        Zebra stripes the proof steps.

        @param rows - The proof step rows
     */
  this.colorRows = function (rows) {
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

  // exercise solving
  this.exerciseSolver = new OneWayExerciseSolver()

  /**
        Solves the exercise
     */
  this.solveExercise = function () {
    const exerciseType = this.getExerciseType()
    const formula = this.getFormula()
    let exercise

    exercise = new OneWayExercise(formula, exerciseType, false, false)
    this.exerciseSolver.solve(exercise, this.onExerciseSolved, this.onErrorSolvingExercise)
  }

  /**
        Handles the event that an exercise is solved
        @param {ProofStepCollection} solution - The solution
     */
  this.onExerciseSolved = function (solution) {
    let lastStep = null
    let firstStep = null

    $('#exercise-left-formula').text(solution.steps[0].formula)
    firstStep = solution.steps[0]
    jQuery.each(solution.steps, function () {
      lastStep = this
      self.insertStep(this, false)
    })
    if (lastStep) {
      self.insertLastStep(firstStep, lastStep)
    }
    self.colorRows()
  }

  /**
        Handles the error that an exercise can not be solved
     */
  this.onErrorSolvingExercise = function () {
    self.showErrorToolTip($(BTN_SOLVEEXERCISE), Resources.getSpecificMessage(LogEXSession.getLanguage(), 'error-solving-exercise'), 'right')
    this.disableUI(false)
  }

  /**
        Inserts a proof step

        @param {ProofStep} step - The proof step
        @param {Boolean} canDelete - True if the proof step can be deleted, false otherwise
     */
  this.insertStep = function (step, canDelete) {
    const exerciseStepHtml = this.renderStep(step, canDelete)

    $('#active-step').before(exerciseStepHtml)
  }

  this.renderStep = function (step, canDelete) {
    let rule = ''
    const stepTemplate = $('#exercise-step-template')
    let exerciseStepHtml
    const error = ''

    if (step.rule === null) { // dit is de startopgave
      return
    }

    if (step.rule !== '') {
      rule = Resources.getRule(LogEXSession.getLanguage(), step.rule)
    }

    exerciseStepHtml = stepTemplate.render({
      error: error,
      rule: rule,
      formula: step.formula,
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
  this.insertLastStep = function (firstStep, lastStep) {
    const stepTemplate = $('#exercise-last-step-template')
    const exerciseStepHtml = stepTemplate.render({
      leftformula: firstStep.formula,
      rightformula: lastStep.formula
    })

    $('#active-step').before(exerciseStepHtml)
  }
}
