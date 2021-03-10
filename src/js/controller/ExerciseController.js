import { config } from '../config.js'
import { KeyBindings } from '../keyBindings.js'

export class ExerciseController {
  constructor () {
    this.formulaPopover = null
    this.exerciseType = ''
    this.exercise = null
    this.dummyExercise = null // wordt gebruikt om te testen of de laatste stap equivalent is met de opgave bij shownextstep met validatie per stap af.
    this.isFormulaValid = true
    this.keyBindings = new KeyBindings(this)
    this.exampleExercises = null

    // document.getElementById('generate-exercise').addEventListener('click', function () {
    //   if (config.randomExercises) {
    //     this.generateExercise()
    //   }
    // }.bind(this))

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

  /**
        Generates an exercise.
     */
  generateExercise (properties) {
    this.reset()
    this.disableUI(true)
    document.getElementById('exercise-container').style.display = ''

    this.exerciseGenerator.generate(this.exerciseType, properties, this.onExerciseGenerated.bind(this), this.onErrorGeneratingExercise.bind(this))
  }

  /**
        Get an example exercise.
     */
  useExercise (exerciseNumber, properties) {
    this.reset()
    this.disableUI(true)
    document.getElementById('exercise-container').style.display = ''

    this.exerciseGenerator.example(exerciseNumber, this.exerciseType, properties, this.onExerciseGenerated.bind(this), this.onErrorGeneratingExercise.bind(this))
  }

  /**
        Inserts a proof step

        @param {ProofStep} step - The proof step
        @param {Boolean} canDelete - True if the proof step can be deleted, false otherwise
     */
  insertStep (step, canDelete) {
    this.dismissAlert()
    const exerciseStep = document.createElement('tr')
    exerciseStep.classList.add('exercise-step')
    exerciseStep.innerHTML = this.renderStep(step, canDelete)

    const tableBody = document.getElementById('active-step')
    tableBody.insertAdjacentElement('beforebegin', exerciseStep)

    this.formulaPopover.previousValue = step.formula
    document.getElementById('active-step-number').innerHTML = this.exercise.steps.steps.length + 1
  }

  // Updates the alert which gives user feedback with the html content and styled based on the type of alert
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

  // Highlights the location of an error
  setErrorLocation (elementId) {
    this.clearErrors()
    document.getElementById(elementId).classList.add('error')
  }

  dismissAlert () {
    document.getElementById('exercise-alert-container').style.display = 'none'
  }

  clearErrors () {
    const elements = document.getElementsByClassName('error')
    while (elements.length > 0) {
      elements[0].classList.remove('error')
    }
  }
}
