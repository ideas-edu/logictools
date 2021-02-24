import { config } from '../config.js'
import { KeyBindings } from '../keyBindings.js'

export class ExerciseController {
  constructor () {
    this.exerciseType = ''
    this.exercise = null
    this.dummyExercise = null // wordt gebruikt om te testen of de laatste stap equivalent is met de opgave bij shownextstep met validatie per stap af.
    this.isFormulaValid = true
    this.keyBindings = new KeyBindings(this)
    this.exampleExercises = null

    document.getElementById('generate-exercise').addEventListener('click', function () {
      if (config.randomExercises) {
        this.generateExercise()
      }
    }.bind(this))

    document.getElementById('solve-exercise').addEventListener('click', function () {
      this.showSolution()
    }.bind(this))

    document.getElementById('validate-exercise').addEventListener('click', function () {
      this.validateExercise()
    }.bind(this))

    document.getElementById('show-next-step').addEventListener('click', function () {
      this.showNextStep()
    }.bind(this))

    document.getElementById('show-hint').addEventListener('click', function () {
      this.showHint()
    }.bind(this))

    // key bindings
    document.addEventListener('keydown', function (e) {
      this.keyBindings.onKeyDown(e)
    }.bind(this))
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
        return
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
      sParameterName = sURLVariables[i].split('=')
      if (sParameterName[0] === 'formula') {
        this.exerciseType = sParameterName[1]
        return
      }
    }
  }

  /**
      Initializes hint, next step and complete derivation button
   */
  initializeButtons () {
    if (config.displayHintButton) {
      document.getElementById('show-hint').style.display = ''
    }
    if (config.displayNextStepButton) {
      document.getElementById('show-next-step').style.display = ''
    }
    if (config.displayDerivationButton) {
      document.getElementById('showderivation').style.display = ''
      document.getElementById('solve-exercise').style.display = ''
    }
  }

  /**
      Use the example exercises
    */
  bindExampleExercises () {
    for (let i = 0; i < this.exampleExercises.length; i++) {
      const nr = this.exampleExercises[i]
      const id = 'exercise' + (nr + 1)
      document.getElementById(id).addEventListener('click', function () {
        this.useExercise(nr)
      }.bind(this))
    }
  }
}
