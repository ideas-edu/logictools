import $ from 'jquery'
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
import { config } from '../config.js'
import { LogEXSession } from '../logEXSession.js'
import { Resources } from '../resources.js'
import { OneWayExerciseGenerator } from '../model/oneway/exerciseGenerator.js'
import { OneWayExerciseSolver } from '../model/oneway/exerciseSolver.js'
import { OneWayExerciseValidator } from '../model/oneway/exerciseValidator.js'
import { OneWayStep } from '../model/oneway/step.js'
import { OneWayExercise } from '../model/oneway/exercise.js'
import { SyntaxValidator } from '../model/syntaxValidator.js'
import { Rules } from '../model/rules.js'
import { showdiff } from '../showdiff.js'
import { translate, loadLanguage } from '../translate.js'

jsrender($) // load JsRender jQuery plugin methods

function ready (fn) {
  if (document.readyState !== 'loading') {
    fn()
  } else {
    document.addEventListener('DOMContentLoaded', fn)
  }
}

function setUp () {
  const controller = new OneWayController()
  controller.getExerciseType()
  window.UITranslate = function () {
    const language = LogEXSession.getLanguage()
    const langCallback = function () {
      controller.updateTexts()
    }
    loadLanguage(language, langCallback)
  }
  controller.initializeRuleJustification()
  controller.initializeStepValidation()
  controller.initializeButtons()
  controller.initializeInput()
  controller.setExampleExercises()
  controller.initializeLabels()
  controller.initializeRules(document.getElementById('rule'))
  controller.bindExampleExercises()
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
        Initializes all buttons and label to correct language
     */
  initializeLabels () {
    window.UITranslate()
  }

  updateTexts () {
    super.updateTexts()
    document.getElementById('exercise-title').innerHTML = translate(`oneWay.title.${this.exerciseType}`)
    if (this.exercise !== null) {
      document.getElementById('instruction').innerHTML = translate(`oneWay.instruction.${this.exerciseType}`,
        {
          formula: this.exercise.formulaKatex,
          title: {
            key: this.exercise.titleKey,
            params: this.exercise.titleParams
          }
        }
      )
    } else if (document.getElementById('new-exercise-container').style.display === '') {
      document.getElementById('instruction').innerHTML = translate('oneWay.instruction.create')
    } else {
      document.getElementById('instruction').innerHTML = translate('oneWay.instruction.begin')
    }
    this.initializeRules(document.getElementById('rule'))
    document.getElementById('header-step').innerHTML = translate('shared.header.step')
    document.getElementById('validate-exercise').innerHTML = translate(`oneWay.button.validateExercise.${this.exerciseType}`)
  }

  /**
        Resets the UI to its original state.
     */
  reset () {
    this.clearErrors()
  }

  /**
        Get an example exercise.
     */

  useExercise (exnr) {
    const properties = {
      ruleJustification: document.getElementById('rule-switch').checked,
      stepValidation: document.getElementById('step-validation-switch').checked,
      titleKey: 'shared.exerciseName.example',
      titleParams: {
        number: exnr + 1
      }
    }

    super.useExercise(exnr, properties)
  }

  /**
        Generates an exercise.
     */
  generateExercise (difficulty) {
    const properties = {
      ruleJustification: document.getElementById('rule-switch').checked,
      stepValidation: document.getElementById('step-validation-switch').checked,
      difficulty: difficulty,
      titleKey: `shared.exerciseName.${difficulty}`
    }

    super.generateExercise(properties)
  }

  /**
        Shows the form for creating a new exercise
     */
  newExercise () {
    super.newExercise()
    document.getElementById('instruction').innerHTML = translate('oneWay.instruction.create')
  }

  /**
        Creates a new exercise
     */

  createExercise () {
    const exerciseMethod = Resources.getExerciseMethod(this.exerciseType)
    const properties = {
      ruleJustification: document.getElementById('rule-switch').checked,
      stepValidation: document.getElementById('step-validation-switch').checked,
      titleKey: 'shared.exerciseName.user'
    }

    const formula = document.getElementById('new-formula').value

    this.disableUI(true)
    this.exercise = new OneWayExercise(formula, exerciseMethod, properties)
    this.exerciseGenerator.create(exerciseMethod, formula, properties, this.showExercise.bind(this), this.onErrorCreatingExercise.bind(this))
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

    document.getElementById('instruction').innerHTML = translate(`oneWay.instruction.${this.exerciseType}`,
      {
        formula: this.exercise.formulaKatex,
        title: {
          key: this.exercise.titleKey,
          params: this.exercise.titleParams
        }
      })
    document.getElementById('active-step').style.display = ''

    $('#exercise-steps').show()
    if ($('#new-exercise-content')) {
      $('#new-exercise-content').remove()
    }

    document.getElementById('formula').value = this.exercise.formula

    this.disableUI(false)

    if (config.displayDerivationButton) {
      $('#solve-exercise').show()
    }
    $('#validate-exercise').show()
    $('#exercise-right-formula').show()
    $('#bottom').show()
    $('#equivsign').attr('src', 'img/equivsignok.png')

    // When using hotkeys focus on formula field must be reset
    if ((LogEXSession.getStudentId() > 0)) {
      $('#formula').blur()
      $('#formula').focus()
    }

    // Reset rule value at start
    document.getElementById('rule').selectedIndex = 0

    // doh: zorg dat regelverantwoording niet undefined kan zijn
    // this.exercise.usesRuleJustification = $('#rule-switch').bootstrapSwitch('state')

    // rvl: Check if rule justification is needed
    if (this.exercise.usesRuleJustification) {
      $('#rule').show()
    } else {
      $('#rule').hide()
    }

    document.getElementById('step-validation-switch').disabled = false // $('#step-validation-switch').bootstrapSwitch('disabled', true) // true || false
  }

  /**
        Handles the error that an exercise can not generated
     */
  onErrorGeneratingExercise () {
    this.disableUI(false)
    this.setErrorLocation('new-exercise-dropdown')
    this.updateAlert('shared.error.generatingExercise', null, 'error')
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

    /**
        if (!this.exercise.usesStepValidation && this.exercise.steps.steps.length > 1) {
            this.exerciseValidator.validateStep(this.exercise.type, false, this.dummyExercise.getPreviousStep(), this.dummyExercise.getCurrentStep(), this.showNextStepWithoutStepValidation, this.onErrorSolvingNextStep);

        } else {
            this.exerciseSolver.solveNextStep(this.exercise, this.onNextStepSolved, this.onErrorSolvingNextStep);
        } */
  }

  showNextStepWithoutStepValidation () {
    if (this.dummyExercise.getCurrentStep().isValid || this.dummyExercise.getCurrentStep().isCorrect) {
      this.exerciseSolver.solveNextStep(this.exercise, this.onNextStepSolved, this.onErrorSolvingNextStep)
    } else {
      this.disableUI(false)
      this.setErrorLocation('show-next-step')
      this.updateAlert('shared.error.solvingNextStepInv', null, 'error')
    }
  }

  /**
        Handles the event thats the next step of an exercise is solved
        @param {ProofStep} nextStep - The next step
     */
  onNextStepSolved (nextStep) {
    // if (nextStep !== null) {
    //    this.exercise.steps.push(nextStep);
    //    if (this.exercise.usesStepValidation) {
    //        this.exerciseValidator.validateStep(this.exercise.type, this.exercise.usesRuleJustification, this.exercise.getPreviousStep(), this.exercise.getCurrentStep(), this.onStepValidated, this.onErrorValidatingStep);
    //    } else {
    //        this.onStepValidated();
    //    }
    // }

    if (nextStep !== null) {
      this.clearErrors() // verwijder alle voorgaande foutmeldingen van het scherm
      document.getElementById('step-validation-switch').disabled = true // $('#step-validation-switch').bootstrapSwitch('disabled', false) // na validatie van minstens 1 stap, mag de gebruiker niet meer de optie hebben om "correctie per stap" te wijzigen

      this.exercise.steps.push(nextStep)
      this.insertStep(nextStep, true)
      this.exercise.isReady = nextStep.isReady
      this.disableUI(false) // UI hier terug enabled, anders worden de popovers verkeerd gepositioneerd.

      // bij auto step is formula nog niet goed gevuld
      document.getElementById('formula').value = nextStep.formula

      // Bij het gebruik van hotkeys moet de focus van het formula veld worden reset
      $('#formula').blur()
      $('#formula').focus()

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
    this.exerciseSolver.getHelpForNextStep(this.exercise, this.onHelpForNextStepFound.bind(this), this.onErrorGettingHelpForNextStep.bind(this))
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
    const formula = document.getElementById('formula')
    const oldFormula = formula.value
    const newFormula = nextOneWayStep.formula
    const formulaDiff = showdiff(true, newFormula, oldFormula)
    this.updateAlert('shared.hint.full', { rule: Rules[nextOneWayStep.rule], formula: formulaDiff }, 'hint', 'shared.hint.autoStep', this.showNextStep.bind(this))
  }

  /**
        Handles the error that the next step can not be solved
     */
  onErrorGettingHelpForNextStep (msg) {
    this.setErrorLocation('show-hint')
    this.updateAlert(msg, null, 'error')
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

    const newFormula = document.getElementById('formula').value
    if (newFormula === this.exercise.getCurrentStep().formula) {
      this.setErrorLocation('formula')
      this.updateAlert('shared.error.notChanged', null, 'error')
      return false
    }

    this.disableUI(true)
    this.clearErrors()
    this.exercise.steps.push(new OneWayStep(newFormula, ruleKey))
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
        $('#bottom').hide()

        const elements = document.getElementsByClassName('remove-step')
        for (const element of elements) {
          element.style.display = 'none'
        }
        document.getElementById('header-actions').style.display = 'none'

        const arrow = katex.renderToString('\\Leftrightarrow', {
          throwOnError: false
        })

        const alertParams = {
          beginFormula: this.exercise.formulaKatex,
          endFormula: this.exercise.getCurrentStep().formulaKatex,
          arrow: arrow
        }
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
    let i = 0
    let isReady = false
    let completelyCorrect = true

    this.reset()
    $.each(this.exercise.steps.steps, function () {
      let rule = ''
      const ruleKey = Rules[this.rule]
      const stepTemplate = $.templates('#exercise-step-template')

      if (this.rule !== undefined && this.rule !== '') {
        rule = translate(ruleKey)
      }

      if (i > 0 && !this.isValid && completelyCorrect === true) {
        completelyCorrect = false
      }

      const exerciseStepHtml = stepTemplate.render({
        rule: rule,
        ruleKey: ruleKey,
        formula: this.formulaKatex,
        canDelete: false,
        isWrong: !this.isValid,
        hasRule: this.rule !== undefined,
        step: i,
        stepValidation: false,
        ruleJustification: this.exercise.usesRuleJustification
      })

      $('#active-step').before(exerciseStepHtml)

      if (this.isReady && !isReady && completelyCorrect === true) {
        isReady = true
        this.insertLastStep(this)
      }

      if (!this.isRuleValid && i > 0) {
        this.initializeRules($('#rule' + i))
      }

      i += 1
    })

    document.getElementById('formula').value = this.exercise.getCurrentStep().formula

    this.disableUI(false)

    if (!isReady) {
      this.setErrorLocation('validate-exercise')
      this.updateAlert('shared.error.incomplete.oneWay', null, 'error')
    }
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
    document.getElementById('step-validation-switch').disabled = true // $('#step-validation-switch').bootstrapSwitch('disabled', false) // na validatie van minstens 1 stap, mag de gebruiker niet meer de optie hebben om "correctie per stap" te wijzigen

    // de stap is niet valid en gebruikt stap validatie
    if (!currentStep.isValid && this.exercise.usesStepValidation) {
      message = 'shared.error.wrongStep'
      this.exercise.steps.pop()

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

  /**
        Validates the formulas

        @param onFormulasValidated - The callback function
     */
  validateInput (afterInputValidated) {
    this.clearErrors()
    this.validateFormula(document.getElementById('formula'), function (isValid, formulaText) {
      this.onInputValidated(isValid, formulaText, afterInputValidated)
    })
  }

  /**
        Handles the event that formula 1 is validated

        @param {Boolean} isValid - True if valid, false otherwise
        @param {String} formulaText - The text of the formula
        @param onFormulasValidated - The callback function
     */
  onInputValidated (isValid, formulaText, afterInputValidated) {
    this.onFormulaValidated(isValid, formulaText)
    afterInputValidated()
  }

  /**
        Handles the event that a formula is validated

        @param {Boolean} isValid - True if the formula is valid, false otherwise
        @param {String} formulaText - The text of the formula
     */
  // this.onFormulaValidated = function (isValid, formulaText) {
  onFormulaValidated (isValid) {
    if (!isValid) {
      this.setErrorLocation('formula')
      this.updateAlert('shared.error.invalidFormula', null, 'error')
    }
    this.isFormulaValid = isValid
  }

  /**
        Validates the formula

        @param formula - The DOM element that contains the formula
        @param onFormulasValidated - The callback function
     */
  validateFormula (formula, callbackFunc) {
    if (callbackFunc === undefined) {
      callbackFunc = this.onFormulaValidated
    }

    if (this.exercise.usesStepValidation) {
      this.syntaxValidator.validateSyntax(formula.val(), callbackFunc)
    } else {
      callbackFunc(true, formula.val())
    }
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
    const stepTemplate = $('#exercise-last-step-template')
    const exerciseStepHtml = stepTemplate.render({
      leftformula: this.exercise.formula,
      rightformula: step.formulaKatex
    })

    $('#active-step').before(exerciseStepHtml)
    $('#active-step').hide()
    $('#bottom').hide()

    document.getElementById('header-actions').style.display = 'none'
    const elements = document.getElementsByClassName('remove-step')
    for (const element of elements) {
      element.style.display = 'none'
    }

    this.clearErrors()

    document.getElementById('step-validation-switch').disabled = false // $('#step-validation-switch').bootstrapSwitch('disabled', true) // true || false
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

  retryFormula (source) {
    const parent = source.parents('div.exercise-step-added')
    const allExerciseSteps = $('#exercise-steps div.exercise-step-added')
    const index = allExerciseSteps.index(parent)

    this.exercise.steps.steps[index].formula = source.val()
  }

  retryRule (source) {
    const parent = source.parents('div.exercise-step-added')
    const allExerciseSteps = $('#exercise-steps div.exercise-step-added')
    const index = allExerciseSteps.index(parent)

    this.exercise.steps.steps[index].rule = source.val()
  }
}
