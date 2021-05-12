import jsrender from 'jsrender'
import 'bootstrap'
import 'iframe-resizer'
import 'bootstrap/dist/css/bootstrap.min.css'
import '@fortawesome/fontawesome-free/js/fontawesome'
import '@fortawesome/fontawesome-free/js/solid'
import '@fortawesome/fontawesome-free/js/regular'
import '@fortawesome/fontawesome-free/js/brands'
import 'katex/dist/katex.min.css'
import katex from 'katex'

import { FormulaPopover } from '../../shared/kbinput/kbinput.js'

import { LogExController } from './LogExController.js'
import { ExerciseTypes } from '../model/exerciseTypes.js'
import { LogEXSession } from '../logEXSession.js'
import { OneWayExerciseGenerator } from '../model/oneway/exerciseGenerator.js'
import { OneWayExerciseSolver } from '../model/oneway/exerciseSolver.js'
import { OneWayExerciseValidator } from '../model/oneway/exerciseValidator.js'
import { OneWayStep } from '../model/oneway/step.js'
import { OneWayExercise } from '../model/oneway/exercise.js'
import { SyntaxValidator } from '../model/syntaxValidator.js'
import { Rules } from '../model/rules.js'
import { showdiff } from '../showdiff.js'
import { translate, translateElement, loadLanguage } from '../translate.js'

const $ = jsrender(null)

function ready (fn) {
  if (document.readyState !== 'loading') {
    fn()
  } else {
    document.addEventListener('DOMContentLoaded', fn)
  }
}

function setUp () {
  const controller = new OneWayController()
  window.translate = loadLanguage
  loadLanguage(LogEXSession.getLanguage())
  controller.initializeRuleJustification()
  controller.initializeStepValidation()
  controller.initializeInput()
  controller.setExampleExercises()
  controller.initializeRules(document.getElementById('rule'))
}

ready(setUp)

/**
    OneWayController is responsible for handling all user interaction and manipulation of the user interface.
    @constructor
 */

class OneWayController extends LogExController {
  constructor () {
    super()
    this.exerciseGenerator = new OneWayExerciseGenerator()
    this.exerciseSolver = new OneWayExerciseSolver()
    // validation
    this.exerciseValidator = new OneWayExerciseValidator()
    this.syntaxValidator = new SyntaxValidator()

    document.getElementById('validate-exercise').addEventListener('mousedown', function () {
      this.validateExercise()
    }.bind(this))

    translateElement(document.getElementById('exercise-title'), `oneWay.title.${this.exerciseType}`)
    translateElement(document.getElementById('validate-exercise'), `oneWay.button.validateExercise.${this.exerciseType}`)
  }

  /**
        Creates the popover for the input of symbols
    */
  initializeInput () {
    const formulaOptions = {
      id: 1,
      allowUndo: true,
      characters: this.characterOptions
    }
    const newFormulaOptions = {
      id: 2,
      characters: this.characterOptions
    }
    this.formulaPopover = new FormulaPopover(document.getElementById('formula'), document.getElementById('one-way-input'), formulaOptions)
    this.newFormulaPopover = new FormulaPopover(document.getElementById('new-formula'), document.getElementById('new-input'), newFormulaOptions)
  }

  /**
        Get an example exercise.
     */

  useExercise (properties) {
    properties.ruleJustification = document.getElementById('rule-switch').checked
    properties.stepValidation = document.getElementById('step-validation-switch').checked

    super.useExercise(properties)
  }

  /**
        Generates an exercise.
     */
  generateExercise (properties) {
    properties.ruleJustification = document.getElementById('rule-switch').checked
    properties.stepValidation = document.getElementById('step-validation-switch').checked

    super.generateExercise(properties)
  }

  /**
        Shows the form for creating a new exercise
     */
  newExercise () {
    super.newExercise()
    translateElement(document.getElementById('instruction'), 'oneWay.instruction.create')
  }

  /**
        Creates a new exercise
     */

  createExercise () {
    const exerciseMethod = ExerciseTypes[this.exerciseType]
    const properties = {
      ruleJustification: document.getElementById('rule-switch').checked,
      stepValidation: document.getElementById('step-validation-switch').checked,
      titleKey: 'shared.exerciseName.user'
    }

    const formula = document.getElementById('new-formula')

    if (!this.validateFormula(formula, this.newExerciseAlert)) {
      return
    }

    this.disableUI(true)
    this.dismissAlert()
    this.exercise = new OneWayExercise(formula.value, exerciseMethod, properties)
    this.exerciseGenerator.create(exerciseMethod, formula.value, properties, this.showExercise.bind(this), this.onErrorCreatingExercise.bind(this))
  }

  /**
        Handles the error that an exercise can not be created
     */
  onErrorCreatingExercise () {
    this.exercise = null
    this.disableUI(false)
    this.setErrorLocation('new-formula')
    this.newExerciseAlert.updateAlert('shared.error.creatingExercise', null, 'error')
  }

  /**
    */
  showExercise () {
    document.getElementById('exercise-container').style.display = ''
    document.getElementById('new-exercise-container').style.display = 'none'
    this.clearErrors()

    // Remove old rows
    const exerciseStepTable = document.getElementById('exercise-step-table')
    let stepRow = exerciseStepTable.firstElementChild
    while (true) {
      if (stepRow.classList.contains('exercise-step')) {
        exerciseStepTable.removeChild(stepRow)
        stepRow = exerciseStepTable.firstElementChild
      } else {
        break
      }
    }

    document.getElementById('header-actions').style.display = ''

    // Insert first row
    this.insertStep(this.exercise.steps.steps[0], false)

    translateElement(document.getElementById('instruction'), `oneWay.instruction.${this.exerciseType}`, {
      formula: this.exercise.formulaKatex,
      title: {
        key: this.exercise.titleKey,
        params: this.exercise.titleParams
      }
    })
    document.getElementById('active-step').style.display = ''
    document.getElementById('bottom').style.display = ''

    document.getElementById('formula').value = this.exercise.formula

    this.disableUI(false)

    // Reset rule value at start
    document.getElementById('rule').selectedIndex = 0

    // rvl: Check if rule justification is needed
    // if (this.exercise.usesRuleJustification) {
    //   $('#rule').show()
    // } else {
    //   $('#rule').hide()
    // }

    document.getElementById('step-validation-switch').disabled = false
  }

  showSolution () {
    window.open('onewaysolution.html?formula=' + this.exercise.formula + '&exerciseType=' + this.exercise.type, '_blank', 'location=no,width=1020,height=600,status=no,toolbar=no')
  }

  /**
        Shows the next step
     */
  showNextStep () {
    this.dummyExercise = new OneWayExercise(this.exercise.formula, this.exercise.type, false, false)
    this.dummyExercise.steps.push(new OneWayStep(this.exercise.getCurrentStep().formula, ''))
    this.disableUI(true)
    this.exerciseSolver.solveNextStep(this.exercise, this.onNextStepSolved.bind(this), this.onErrorSolvingNextStep.bind(this))
  }

  /**
        Handles the event thats the next step of an exercise is solved
        @param {ProofStep} nextStep - The next step
     */
  onNextStepSolved (nextStep) {
    if (nextStep !== null) {
      this.clearErrors() // verwijder alle voorgaande foutmeldingen van het scherm
      document.getElementById('step-validation-switch').disabled = true // na validatie van minstens 1 stap, mag de gebruiker niet meer de optie hebben om "correctie per stap" te wijzigen

      this.exercise.steps.push(nextStep)
      this.insertStep(nextStep, true)
      this.exercise.isReady = nextStep.isReady
      this.disableUI(false) // UI hier terug enabled, anders worden de popovers verkeerd gepositioneerd.

      // bij auto step is formula nog niet goed gevuld
      document.getElementById('formula').value = nextStep.formula

      //    Reset rule value after valid step
      document.getElementById('rule').selectedIndex = 0
    } else {
      this.disableUI(false) // UI ook hier terug enabled in geval er geen volgende stappen meer zijn.
    }
  }

  /**
        Handles the error that the next step can not be solved
     */
  onErrorSolvingNextStep (error) {
    this.disableUI(false)
    this.setErrorLocation('show-next-step')
    this.updateAlert(error, null, 'error')
  }

  /**
        Shows the hint
     */
  showHint () {
    if (!this.exercise.isReady) {
      this.exerciseSolver.getHelpForNextStep(this.exercise, this.onHelpForNextStepFound.bind(this), this.onErrorGettingHelpForNextStep.bind(this))
    }
  }

  /**
        Handles the event that help for a next step is found
        @param {OneWayStep} nextOneWayStep - The next one way step
     */
  onHelpForNextStepFound (nextOneWayStep) {
    const rule = Rules[nextOneWayStep.rule]
    if (rule !== null) {
      const buttonCallback = function () {
        this.showNextHint(nextOneWayStep)
      }.bind(this)
      this.updateAlert('shared.hint.useRule', { rule: rule }, 'hint', 'shared.hint.nextHint', buttonCallback)
    } else {
      this.updateAlert('shared.hint.unavailable', null, 'hint')
    }
  }

  showNextHint (nextOneWayStep) {
    const oldFormula = this.exercise.steps.steps[this.exercise.steps.steps.length - 1].formula.replaceAll(' ', '')
    const newFormula = nextOneWayStep.formula.replaceAll(' ', '')
    const formulaDiff = showdiff(oldFormula, newFormula).printKatexStyled()
    this.updateAlert('shared.hint.full', { rule: Rules[nextOneWayStep.rule], formula: formulaDiff }, 'hint', 'shared.hint.autoStep', this.showNextStep.bind(this))
  }

  /**
    Validates a step
      Runs callback after correct step has been validated
     */
  validateStep (callback) {
    const ruleKey = this.getSelectedRuleKey()
    if (ruleKey === null && this.exercise.usesRuleJustification && this.exercise.usesStepValidation) {
      this.setErrorLocation('rule')
      this.updateAlert('shared.error.noRule', null, 'error')
      return false
    }

    const newFormula = document.getElementById('formula')
    if (newFormula.value === this.exercise.getCurrentStep().formula) {
      this.setErrorLocation('formula')
      this.updateAlert('shared.error.notChanged', null, 'error')
      return false
    }

    if (this.exercise.usesStepValidation && !this.validateFormula(newFormula, this.exerciseAlert)) {
      return false
    }

    this.disableUI(true)
    this.clearErrors()
    this.exercise.steps.push(new OneWayStep(newFormula.value, ruleKey))
    if (this.exercise.usesStepValidation) {
      const validatorCallback = function () {
        if (this.onStepValidated()) {
          callback()
        }
      }.bind(this)
      this.exerciseValidator.validateStep(this.exercise, this.exercise.usesRuleJustification, this.exercise.getPreviousStep(), this.exercise.getCurrentStep(), validatorCallback, this.onErrorValidatingStep.bind(this))
    } else {
      if (this.onStepValidated()) {
        callback()
      }
    }
  }

  /**
        Validates an exercise
      */

  validateExercise () {
    // Exercise is still validate if user forgets to click validate step on last step. So validate the current step if formula has changed
    const newFormula = document.getElementById('formula').value
    if (newFormula !== this.exercise.getCurrentStep().formula) {
      this.validateStep(this.validateExercise.bind(this))
      return
    }

    if (this.exercise.usesStepValidation) {
      this.checkIfReady()
    } else {
      this.exerciseValidator.validateExercise(this.exercise, 0, 0, this.onExerciseValidated.bind(this), this.onErrorExerciseValidate.bind(this))
    }
  }

  /**
    Check if the exercise is completed
      */

  checkIfReady () {
    const onError = function (data) {
      alert('Error calling ready service')
    }
    const onSuccess = function (data) {
      if (data.ready) {
        document.getElementById('active-step').style.display = 'none'
        document.getElementById('bottom').style.display = 'none'

        const elements = document.getElementsByClassName('remove-step')
        for (const element of elements) {
          element.style.display = 'none'
        }
        document.getElementById('header-actions').style.display = 'none'

        const alertParams = {
          beginFormula: this.exercise.formulaKatex,
          endFormula: this.exercise.getCurrentStep().formulaKatex
        }
        this.exercise.isReady = true
        this.updateAlert('oneWay.solution', alertParams, 'complete')
        this.disableUI(false)
      } else {
        this.setErrorLocation('formula')
        this.updateAlert('shared.error.incomplete.oneWay', null, 'error')
        this.disableUI(false)
      }
    }
    this.disableUI(true)
    this.exerciseValidator.validateReady(this.exercise, onSuccess.bind(this), onError.bind(this))
  }

  onExerciseValidated () {
    // not implemented
  }

  onErrorExerciseValidate () {
    this.setErrorLocation('validate-step')
    this.updateAlert('shared.error.validatingExercise', null, 'error')
  }

  /**
        Handles the event that a step is validated

     */
  onStepValidated () {
    const currentStep = this.exercise.getCurrentStep()
    let message
    let errorLocation

    this.clearErrors() // verwijder alle voorgaande foutmeldingen van het scherm
    document.getElementById('step-validation-switch').disabled = true // na validatie van minstens 1 stap, mag de gebruiker niet meer de optie hebben om "correctie per stap" te wijzigen

    // de stap is niet valid en gebruikt stap validatie
    if (!currentStep.isValid && this.exercise.usesStepValidation) {
      message = 'shared.error.wrongStep'
      this.exercise.steps.pop()
      console.log(currentStep)

      if (!currentStep.isSyntaxValid) { // Foutieve syntax
        message = 'shared.error.invalidFormula'
        errorLocation = 'formula'
      } else if (currentStep.isSimilar) { // Ongewijzigde formule
        message = 'shared.error.similar'
        errorLocation = 'formula'
      } else if (currentStep.isCorrect) { // Gemaakte stap is juist, maar onduidelijk wat de gebruiker heeft uitgevoerd
        message = 'shared.error.correctNotVal'
        errorLocation = 'formula'
      } else if (currentStep.isBuggy) { // Gemaakte stap is foutief, maar de strategie weet wat er fout is gegaan
        message = `buggyRule.${currentStep.buggyRule}`
        errorLocation = 'formula'
      } else if (!currentStep.isRuleValid) { // De ingegeven regel is niet correct
        message = 'shared.error.wrongRule'
        errorLocation = 'rule'
      } else if (!currentStep.isValid) {
        message = 'shared.error.wrongStep'
        errorLocation = 'formula'
      }

      this.disableUI(false) // disableUI(false) moet opgeroepen worden voordat de errorTooltip getoond wordt, anders wordt de tooltip te laag getoond (= hoogte van het wait-icoontje)
      this.setErrorLocation(errorLocation)
      this.updateAlert(message, null, 'error')
      return false
    } else {
      this.insertStep(currentStep, true)
      this.exercise.isReady = currentStep.isReady

      // bij auto step is formula nog niet goed gevuld
      document.getElementById('formula').value = currentStep.formula

      this.disableUI(false)

      //    Reset rule value after valid step
      document.getElementById('rule').selectedIndex = 0
      return true
    }
  }

  /**
        Handles the error that the step can not be validated
     */
  onErrorValidatingStep () {
    this.exercise.steps.pop()
    this.disableUI(false)
    this.setErrorLocation('validate-step')
    this.updateAlert('shared.error.validatingStep', null, 'error')
  }

  insertStep (step, canDelete) {
    super.insertStep(step, canDelete)
    document.getElementById('active-step-number').innerHTML = this.exercise.steps.steps.length + 1
  }

  renderStep (step, canDelete) {
    let rule = ''
    let arrow = null
    const stepTemplate = $.templates('#exercise-step-template')
    const ruleKey = Rules[step.rule]

    if (step.rule !== undefined) {
      rule = translate(ruleKey)
    }

    if (step.number > 1) {
      arrow = katex.renderToString('\\Leftrightarrow', {
        throwOnError: false
      })
    }

    const exerciseStepHtml = stepTemplate.render({
      rule: rule,
      ruleKey: ruleKey,
      formula: step.formulaKatex,
      canDelete: canDelete,
      step: step.number,
      arrow: arrow,
      stepValidation: true,
      ruleJustification: true
    })

    return exerciseStepHtml
  }

  /**
        Inserts the last proof step

        @param {ProofStep} step - The proof step
     */
  insertLastStep (step) {
    const stepTemplate = $.templates('#exercise-last-step-template')
    const exerciseStepHtml = stepTemplate.render({
      leftformula: this.exercise.formula,
      rightformula: step.formulaKatex
    })

    document.getElementById('active-step').insertAdjacentElement('beforebegin', exerciseStepHtml)
    document.getElementById('active-step').style.display = 'none'
    document.getElementById('bottom').style.display = 'none'

    document.getElementById('header-actions').style.display = 'none'
    const elements = document.getElementsByClassName('remove-step')
    for (const element of elements) {
      element.style.display = 'none'
    }

    this.clearErrors()

    document.getElementById('step-validation-switch').disabled = false
  }

  removeStep (index) {
    if (index === 1) {
      // Don't remove base step
      return
    }

    const exerciseStepTable = document.getElementById('exercise-step-table')

    for (let i = exerciseStepTable.children.length - 1; i >= 0; i--) {
      if (exerciseStepTable.children[i].getAttribute('number') >= index) {
        exerciseStepTable.removeChild(exerciseStepTable.children[i])
      }
    }
    this.exercise.steps.removeTopSteps(index - 1)
    document.getElementById('active-step-number').innerHTML = this.exercise.steps.steps.length + 1
    this.formulaPopover.previousValue = this.exercise.steps.steps[index - 2].formula
    this.formulaPopover.setText(this.exercise.steps.steps[index - 2].formula)
  }
}
