import config from '../../../config.json'
import { translateElement } from '../translate.js'

export class LogExSolutionController {
  constructor () {
    this.getExerciseType()
    this.config = config.tools[this.controllerId]
  }

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
        this.exerciseType = sParameterName[1]
      }
      if (sParameterName[0] === 'controller') {
        this.controllerId = sParameterName[1]
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
        Solves the exercise
     */
  solveExercise () {
    const formula = this.getFormula()

    const exercise = new this.ExerciseType(formula, this.exerciseType, false, false)
    this.exerciseSolver.solve(exercise, this.onExerciseSolved.bind(this), this.onErrorSolvingExercise.bind(this))
  }

  /**
        Handles the error that an exercise can not be solved
     */
  onErrorSolvingExercise () {
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
