import { LogEXSession } from '../logEXSession.js'
import { Resources } from '../resources.js'
import { translateElement } from '../translate.js'
// import { ExerciseController } from './ExerciseController.js'

export class LogExSolutionController {
  updateTexts () {
    const elements = document.querySelectorAll('[translate-key]')
    for (const element of elements) {
      translateElement(element)
    }
  }

  /**
        Gets the exercisetype as given in the querystring
    */
  getExerciseType () {
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
  getFormula () {
    const sPageURL = window.location.search.substring(1)
    const sURLVariables = sPageURL.split('&')
    let sParameterName
    let i
    for (i = 0; i < sURLVariables.length; i += 1) {
      sParameterName = sURLVariables[i].split(/=(.+)/)
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
  showErrorToolTip (element, toolTipText, placement) {
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
        Solves the exercise
     */
  solveExercise () {
    const exerciseType = this.getExerciseType()
    const formula = this.getFormula()

    const exercise = new this.ExerciseType(formula, exerciseType, false, false)
    this.exerciseSolver.solve(exercise, this.onExerciseSolved.bind(this), this.onErrorSolvingExercise.bind(this))
  }

  /**
        Handles the error that an exercise can not be solved
     */
  onErrorSolvingExercise () {
    this.showErrorToolTip(document.getElementById('solve-exercise'), Resources.getSpecificMessage(LogEXSession.getLanguage(), 'error-solving-exercise'), 'right')
    this.disableUI(false)
  }

  insertStep (step, canDelete) {
    const exerciseStep = document.createElement('tr')
    exerciseStep.classList.add('exercise-step')
    exerciseStep.innerHTML = this.renderStep(step, canDelete)

    const tableBody = document.getElementById('active-step')
    if (step.isBottomStep) {
      tableBody.insertAdjacentElement('afterend', exerciseStep)
    } else {
      tableBody.insertAdjacentElement('beforebegin', exerciseStep)
    }
  }
}
