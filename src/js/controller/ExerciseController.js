import config from '../../../config.json'
import { IdeasServiceProxy } from '../model/ideasServiceProxy.js'
import { KeyBindings } from '../keyBindings.js'
import { ExerciseAlert } from '../exerciseAlert.js'
import { translateElement } from '../translate.js'
import { LogEXSession } from '../logEXSession.js'

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
    if (document.getElementById('create-exercise')) {
      this.newExerciseAlert = new ExerciseAlert('new-exercise-alert')
      document.getElementById('create-exercise').addEventListener('mousedown', function () {
        this.createExercise()
      }.bind(this))
    }

    this.getExerciseType()
    this.config = config.tools[this.exerciseType]
    this.fillProgressbars() 
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

    document.getElementById('validate-step').addEventListener('mousedown', function () {
      this.validateStep()
    }.bind(this))

    document.getElementById('show-solve-exercise').addEventListener('click', function () {
      this.showSolution()
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
        LogEXSession.setExerciseType (sParameterName[1])
        return
      }
    }
  }

  fillProgressbars(){
    if (this.config.levelExercises !== undefined) { 
      if (this.config.levelExercises.active) {
        let studentProgress = LogEXSession.getProgressbarValues()
        if (studentProgress !== null) {
          this.fillProgressbar('easy', studentProgress[0])
          this.fillProgressbar('medium', studentProgress[1])
          this.fillProgressbar('difficult', studentProgress[2])
        }
      }
      else {
        document.getElementById('progressbars').style.display = 'none'
      }
    }
  }

  fillProgressbar(difficulty, number){
    let element = `${difficulty}-bar`
    document.getElementById(element).innerHTML = number
    document.getElementById(element).setAttribute('area-valuenow', number)
    document.getElementById(element).style.width = (number * 100 / LogEXSession.getNumberOfExercises(difficulty) ) + '%'
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
    translateElement(select, 'shared.button.selectRule')
    comboRule.appendChild(select)
    if (ruleSet === undefined) {
      ruleSet = this.config.rules
    }

    for (const rule of ruleSet) {
      // Rule will only be displayed if it has not already been displayed
      const option = document.createElement('option')
      translateElement(option, `rule.${rule}`)
      option.value = rule
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

    // inserts the leveled exercises 
      if (this.config.levelExercises !== undefined) {
      exerciseMenu.innerHTML += '<div class="dropdown-divider"></div>'
      exerciseMenu.innerHTML += '<a class="dropdown-item" href="#" translate-key="shared.button.generateExerciseEasy" id="generate-exercise-easy"></a>'
      exerciseMenu.innerHTML += '<a class="dropdown-item" href="#" translate-key="shared.button.generateExerciseNormal" id="generate-exercise-normal"></a>'
      exerciseMenu.innerHTML += '<a class="dropdown-item" href="#" translate-key="shared.button.generateExerciseDifficult" id="generate-exercise-difficult"></a>'
    }

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
    //binds the leveled exercises 
      if (this.config.levelExercises !== undefined) {
      document.getElementById('generate-exercise-easy').addEventListener('click', function () {
        this.useLevelExercise({ difficulty: 'easy' })
      }.bind(this))

      document.getElementById('generate-exercise-normal').addEventListener('click', function () {
        this.useLevelExercise({ difficulty: 'medium' })
      }.bind(this))

      document.getElementById('generate-exercise-difficult').addEventListener('click', function () {
        this.useLevelExercise({ difficulty: 'difficult' })
      }.bind(this))
    }

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
    this.setContainer('exercise-container')

    properties.titleKey = `shared.exerciseName.${properties.difficulty}`

    this.exerciseGenerator.generate(this.exerciseType, properties, this.onExerciseGenerated.bind(this), this.onErrorGeneratingExercise.bind(this))
  }

  /**
        Get a level exercise.
     */
  useLevelExercise (properties) { 
    this.clearErrors()
    this.disableUI(true)
    this.setContainer('exercise-container')
    let exerciseNumber = LogEXSession.getLevelExerciseNumber(this.exerciseType, properties.difficulty) 
    //let exerciseNumber = LogEXSession.getLevelExerciseNumber(properties.difficulty) 
  
    if (exerciseNumber < 0)
    {
      switch (exerciseNumber) {
        case -1:
          //TODO Marianne
          //let level = translate(`shared.exerciseName.${properties.difficulty}`)
          //translateElement(document.getElementById('instruction'), 'shared.instruction.levelFinished', {level: level}) 
          translateElement(document.getElementById('instruction'), 'shared.instruction.levelFinished', {level: properties.difficulty}) 
          break;
        case -2:
          //TODO Marianne
          //let type = translate(`main.tabTitle.${this.config.code}`)
          //translateElement(document.getElementById('instruction'), 'shared.instruction.typeFinished', {type: type}) 
          translateElement(document.getElementById('instruction'), 'shared.instruction.typeFinished', {type: this.exerciseType}) 
          break;
        case -3:
          translateElement(document.getElementById('instruction'), 'shared.instruction.allFinished') 
          break;
        case -4:
            translateElement(document.getElementById('instruction'), 'shared.instruction.fillUseridFirst') 
      }
      document.getElementById('exercise-container').style.display = 'none'
      if (document.getElementById('new-exercise-container')) {
        document.getElementById('new-exercise-container').style.display = 'none'
      }
    }
    else
    {
      properties.titleKey = `shared.exerciseName.${properties.difficulty}`
      properties.titleParams = {
        number: exerciseNumber
      }

      this.exerciseGenerator.example(exerciseNumber, this.exerciseType, properties, this.onExerciseGenerated.bind(this), this.onErrorGeneratingExercise.bind(this))
    }
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
    this.setContainer('exercise-container')

    this.exerciseGenerator.example(properties.exerciseNumber, this.exerciseType, properties, this.onExerciseGenerated.bind(this), this.onErrorGeneratingExercise.bind(this))
  }

  /**
        Shows the form for creating a new exercise
     */
  newExercise () {
    this.setContainer('new-exercise-container')
  }

  setContainer (container) {
    document.getElementById('exercise-container').style.display = 'none'
    if (document.getElementById('new-exercise-container')) {
      document.getElementById('new-exercise-container').style.display = 'none'
    }

    if (document.getElementById(container)) {
      document.getElementById(container).style.display = ''
    }
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
  setErrorLocation (elementIds) {
    this.clearErrors()
    if (typeof elementIds === 'string') {
      elementIds = [elementIds]
    }
    for (const elementId of elementIds) {
      document.getElementById(elementId).classList.add('error')
    }
  }

  dismissAlert () {
    document.getElementById('exercise-alert-container').style.display = 'none'
    this.exerciseAlert.alertKey = null
    this.exerciseAlert.alertParams = null

    if (document.getElementById('new-exercise-alert-container')) {
      document.getElementById('new-exercise-alert-container').style.display = 'none'
      this.newExerciseAlert.alertKey = null
      this.newExerciseAlert.alertParams = null
    }
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
    if (this.exerciseAlert.type === 'error') {
      this.dismissAlert()
    }
  }

  /**
        Validates the formula

        @param formula - The DOM element that contains the formula
        @param onFormulasValidated - The callback function
     */
  validateFormula (formulaElement, alert) {
    const result = this.syntaxValidator.validateSyntax(formulaElement.value, this.formulaOptions)
    if (result !== null) {
      this.setErrorLocation(formulaElement.id)
      alert.updateAlert(result.key, result.params, 'error')
      this.isFormulaValid = false
      IdeasServiceProxy.log(this.config, { exerciseid: this.exercise.type, formula: formulaElement.value, syntaxError: result.key })
      return false
    }
    this.isFormulaValid = true
    return true
  }
}
