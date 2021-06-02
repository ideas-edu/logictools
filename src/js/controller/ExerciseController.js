import config from '../../../config.json'
import { KeyBindings } from '../keyBindings.js'
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

    this.getExerciseType()
    this.config = config.tools[this.exerciseType]
    this.initializeButtons()

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

    document.getElementById('validate-step').addEventListener('click', function () {
      this.validateStep()
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
    if (this.config.displayHintButton) {
      document.getElementById('show-hint').style.display = ''
    }
    if (this.config.displayNextStepButton) {
      document.getElementById('show-next-step').style.display = ''
    }
    if (this.config.displayDerivationButton) {
      document.getElementById('solve-exercise').style.display = ''
    }
  }

  /**
        Initializes drop down box for rules from Rules dictionary
     */
  initializeRules (comboRule, ruleSet) {
    // Clear ruleset if already set
    comboRule.innerHTML = ''
    const select = document.createElement('option')
    select.setAttribute('translate-key', 'shared.button.selectRule')
    comboRule.appendChild(select)
    if (ruleSet === undefined) {
      ruleSet = this.config.rules
    }

    for (const rule of ruleSet) {
      // Rule will only be displayed if it has not already been displayed
      const option = document.createElement('option')
      option.setAttribute('translate-key', `rule.${rule}`)
      comboRule.appendChild(option)
    }
    // Show '-- Select rule --'
    comboRule.selectedIndex = 0
  }

  getSelectedRuleKey () {
    const index = document.getElementById('rule').selectedIndex
    if (index === 0) {
      return null
    }
    // Subtract 1 for '-- Select rule --'
    return this.config.rules[index - 1]
  }

  /**
      Sets the example exercises
  */
  setExampleExercises () {
    this.exampleExercises = this.config.exampleExercises
    const exerciseMenu = document.getElementById('new-exercise-menu')

    // inserts the example exercises
    for (let i = 0; i < this.exampleExercises.length; i++) {
      const nr = this.exampleExercises[i] + 1
      const id = 'exercise' + nr
      exerciseMenu.innerHTML += `<a class="dropdown-item" href="#" id="${id}" translate-key="shared.exerciseName.example" translate-params='{ "number": ${i + 1}}'></a>`
    }

    // inserts the randomly generated exercises
    if (this.config.randomExercises) {
      exerciseMenu.innerHTML += '<div class="dropdown-divider"></div>'
      exerciseMenu.innerHTML += '<a class="dropdown-item" href="#" translate-key="shared.button.generateExerciseEasy" id="generate-exercise-easy"></a>'
      exerciseMenu.innerHTML += '<a class="dropdown-item" href="#" translate-key="shared.button.generateExerciseNormal" id="generate-exercise-normal"></a>'
      exerciseMenu.innerHTML += '<a class="dropdown-item" href="#" translate-key="shared.button.generateExerciseDifficult" id="generate-exercise-difficult"></a>'
    }

    // inserts own input exercises
    if (this.config.inputOwnExercise) {
      exerciseMenu.innerHTML += '<div class="dropdown-divider"></div>'
      exerciseMenu.innerHTML += '<a class="dropdown-item" href="#" translate-key="shared.button.newExercise" id="new-exercise"></a>'
    }

    this.bindExampleExercises()
  }

  /**
      Use the example exercises
    */
  bindExampleExercises () {
    for (let i = 0; i < this.exampleExercises.length; i++) {
      const nr = this.exampleExercises[i]
      const id = 'exercise' + (nr + 1)
      document.getElementById(id).addEventListener('click', function () {
        this.useExercise({
          exerciseNumber: nr,
          displayNumber: i + 1
        })
      }.bind(this))
    }

    // inserts the randomly generated exercises
    if (this.config.randomExercises) {
      document.getElementById('generate-exercise-easy').addEventListener('click', function () {
        this.generateExercise({ difficulty: 'easy' })
      }.bind(this))

      document.getElementById('generate-exercise-normal').addEventListener('click', function () {
        this.generateExercise({ difficulty: 'medium' })
      }.bind(this))

      document.getElementById('generate-exercise-difficult').addEventListener('click', function () {
        this.generateExercise({ difficulty: 'difficult' })
      }.bind(this))
    }

    // inserts own input exercises
    if (this.config.inputOwnExercise) {
      document.getElementById('new-exercise').addEventListener('click', function () {
        this.newExercise()
      }.bind(this))
    }
  }

  /**
        Generates an exercise.
     */
  generateExercise (properties) {
    this.clearErrors()
    this.disableUI(true)
    document.getElementById('exercise-container').style.display = ''
    document.getElementById('new-exercise-container').style.display = 'none'

    properties.titleKey = `shared.exerciseName.${properties.difficulty}`

    this.exerciseGenerator.generate(this.exerciseType, properties, this.onExerciseGenerated.bind(this), this.onErrorGeneratingExercise.bind(this))
  }

  /**
        Get an example exercise.
     */
  useExercise (properties) {
    properties.titleKey = 'shared.exerciseName.example'
    properties.titleParams = {
      number: properties.displayNumber
    }
    this.clearErrors()
    this.disableUI(true)
    document.getElementById('exercise-container').style.display = ''
    document.getElementById('new-exercise-container').style.display = 'none'

    this.exerciseGenerator.example(properties.exerciseNumber, this.exerciseType, properties, this.onExerciseGenerated.bind(this), this.onErrorGeneratingExercise.bind(this))
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
        Handles the error that the next step can not be solved
     */
  onErrorGettingHelpForNextStep (msg) {
    this.setErrorLocation('show-hint')
    this.updateAlert(msg, null, 'error')
  }

  /**
        Handles the error that an exercise can not generated
     */
  onErrorGeneratingExercise () {
    this.disableUI(false)
    this.setErrorLocation('new-exercise-dropdown')
    this.updateAlert('shared.error.generatingExercise', null, 'error')
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
  }

  // Updates the alert which gives user feedback with the translate string found for given key and styled based on the type of alert.
  // We use keys and params here so that they are updated when switching language
  updateAlert (alertKey, alertParams, type, buttonKey, buttonCallback) {
    this.exerciseAlert.updateAlert(alertKey, alertParams, type, buttonKey, buttonCallback)
  }

  // Highlights the location of an error
  setErrorLocation (elementId) {
    this.clearErrors()
    document.getElementById(elementId).classList.add('error')
  }

  dismissAlert () {
    document.getElementById('exercise-alert-container').style.display = 'none'
    document.getElementById('new-exercise-alert-container').style.display = 'none'
    this.exerciseAlert.alertKey = null
    this.newExerciseAlert.alertKey = null
    this.exerciseAlert.alertParams = null
    this.newExerciseAlert.alertParams = null
  }

  disableUI (disable) {
    const inputs = document.getElementsByTagName('input')
    for (const input of inputs) {
      input.disabled = disable
    }

    document.getElementById('wait-exercise').style.display = disable ? '' : 'none'
  }

  clearErrors () {
    const elements = document.getElementsByClassName('error')
    while (elements.length > 0) {
      elements[0].classList.remove('error')
    }
  }
}
