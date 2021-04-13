import { config } from '../config.js'
import { KeyBindings } from '../keyBindings.js'
import { translate } from '../translate.js'
import { ExerciseAlert } from '../exerciseAlert.js'

export class ExerciseController {
  constructor () {
    this.formulaPopover = null
    this.exerciseType = ''
    this.exercise = null
    this.dummyExercise = null // wordt gebruikt om te testen of de laatste stap equivalent is met de opgave bij shownextstep met validatie per stap af.
    this.isFormulaValid = true
    this.keyBindings = new KeyBindings(this)
    this.exampleExercises = null
    this.exerciseAlert = new ExerciseAlert('exercise-alert')
    this.newExerciseAlert = new ExerciseAlert('new-exercise-alert')

    document.getElementById('exercise-alert-button').addEventListener('click', function () {
      this.exerciseAlert.buttonCallback()
    }.bind(this))

    document.getElementById('solve-exercise').addEventListener('click', function () {
      this.showSolution()
    }.bind(this))

    document.getElementById('show-next-step').addEventListener('click', function () {
      this.showNextStep()
    }.bind(this))

    document.getElementById('show-hint').addEventListener('click', function () {
      this.showHint()
    }.bind(this))

    document.getElementById('create-exercise').addEventListener('mousedown', function () {
      this.createExercise()
    }.bind(this))

    // key bindings
    document.addEventListener('keydown', function (e) {
      this.keyBindings.onKeyDown(e)
    }.bind(this))
  }

  updateTexts () {
    document.getElementById('validate-step').innerHTML = translate('shared.button.validateStep')
    document.getElementById('show-next-step').innerHTML = translate('shared.button.step')
    document.getElementById('solve-exercise').innerHTML = translate('shared.button.solveExercise')
    document.getElementById('new-exercise').innerHTML = translate('shared.button.newExercise')
    document.getElementById('select-exercise').innerHTML = translate('shared.button.selectExercise')
    document.getElementById('create-exercise').innerHTML = translate('shared.button.createExercise')
    document.getElementById('generate-exercise-easy').innerHTML = translate('shared.button.generateExerciseEasy')
    document.getElementById('generate-exercise-normal').innerHTML = translate('shared.button.generateExerciseNormal')
    document.getElementById('generate-exercise-difficult').innerHTML = translate('shared.button.generateExerciseDifficult')
    const exampleExercises = config.exampleExercises[this.exerciseType]
    for (let i = 0; i < exampleExercises.length; i++) {
      const nr = exampleExercises[i] + 1
      document.getElementById(`exercise${nr}`).innerHTML = translate('shared.exerciseName.example', { number: nr })
    }
    this.exerciseAlert.updateTexts()
    this.newExerciseAlert.updateTexts()

    document.getElementById('header-formula').innerHTML = translate('shared.header.formula')
    document.getElementById('header-rule').innerHTML = translate('shared.header.rule')
    document.getElementById('header-actions').innerHTML = translate('shared.header.actions')

    const elements = document.getElementsByClassName('step-rule')
    for (const element of elements) {
      element.innerHTML = translate(element.getAttribute('key'))
    }

    document.getElementById('help-menu').innerHTML = translate('shared.button.help')
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
    document.getElementById('new-exercise-container').style.display = 'none'

    this.exerciseGenerator.generate(this.exerciseType, properties, this.onExerciseGenerated.bind(this), this.onErrorGeneratingExercise.bind(this))
  }

  /**
        Get an example exercise.
     */
  useExercise (exerciseNumber, properties) {
    this.reset()
    this.disableUI(true)
    document.getElementById('exercise-container').style.display = ''
    document.getElementById('new-exercise-container').style.display = 'none'

    this.exerciseGenerator.example(exerciseNumber, this.exerciseType, properties, this.onExerciseGenerated.bind(this), this.onErrorGeneratingExercise.bind(this))
  }

  /**
        Shows the form for creating a new exercise
     */
  newExercise () {
    document.getElementById('exercise-container').style.display = 'none'
    document.getElementById('new-exercise-container').style.display = ''
  }

  /**
        Handles the event that an exercise is generated
     */
  onExerciseGenerated (exercise) {
    this.exercise = exercise
    this.showExercise()
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
    exerciseStep.setAttribute('number', step.number)
    exerciseStep.innerHTML = this.renderStep(step, canDelete)

    if (canDelete) {
      const deleteButton = exerciseStep.getElementsByClassName('delete-step')[0]
      deleteButton.addEventListener('click', function () {
        this.removeStep(step.number)
      }.bind(this))
    }

    const tableBody = document.getElementById('active-step')
    tableBody.insertAdjacentElement('beforebegin', exerciseStep)

    this.formulaPopover.previousValue = step.formula
  }

  // Updates the alert which gives user feedback with the translate string found for given key and styled based on the type of alert.
  // We use keys and params here so that they are updated when switching language
  updateAlert (alertKey, alertParams, type, buttonKey, buttonCallback) {
    this.exerciseAlert.updateAlert(alertKey, alertParams, type, buttonKey, buttonCallback)
    // document.getElementById('exercise-alert-container').style.display = ''
    // switch (type) {
    //   case 'hint':
    //     document.getElementById('exercise-alert-icon').innerHTML = '<i class="fas fa-lg fa-info-circle"></i>'
    //     document.getElementById('exercise-alert').classList = 'alert col-md-12 hint-alert'
    //     break
    //   case 'error':
    //     document.getElementById('exercise-alert-icon').innerHTML = '<i class="fas fa-lg fa-exclamation-circle"></i>'
    //     document.getElementById('exercise-alert').classList = 'alert col-md-12 error-alert'
    //     break
    //   case 'complete':
    //     document.getElementById('exercise-alert-icon').innerHTML = '<i class="fas fa-lg fa-check-circle"></i>'
    //     document.getElementById('exercise-alert').classList = 'alert col-md-12 complete-alert'
    //     break
    // }
    // this.alertKey = alertKey
    // this.alertParams = alertParams
    // this.buttonKey = buttonKey

    // const alertButton = document.getElementById('exercise-alert-button')
    // if (buttonKey !== undefined) {
    //   alertButton.innerHTML = translate(buttonKey)
    //   this.alertButtonCallback = buttonCallback
    //   alertButton.style.display = ''
    // } else {
    //   this.alertButtonCallback = undefined
    //   alertButton.style.display = 'none'
    // }
    // document.getElementById('exercise-alert-span').innerHTML = translate(alertKey, alertParams)
  }

  // Highlights the location of an error
  setErrorLocation (elementId) {
    this.clearErrors()
    document.getElementById(elementId).classList.add('error')
  }

  dismissAlert () {
    document.getElementById('exercise-alert-container').style.display = 'none'
    this.alertKey = null
    this.alertParams = null
  }

  clearErrors () {
    const elements = document.getElementsByClassName('error')
    while (elements.length > 0) {
      elements[0].classList.remove('error')
    }
  }
}
