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
import { TwoWayExerciseGenerator } from '../model/twoway/exerciseGenerator.js'
import { TwoWayExercise } from '../model/twoway/exercise.js'
import { TwoWayExerciseSolver } from '../model/twoway/exerciseSolver.js'
import { TwoWayExerciseValidator } from '../model/twoway/exerciseValidator.js'
import { TwoWayStep } from '../model/twoway/step.js'
import { SyntaxValidator } from '../model/syntaxValidator.js'
import { Rules } from '../model/rules.js'
import { IdeasServiceProxy } from '../model/ideasServiceProxy.js'
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
  const controller = new TwoWayController()
  controller.getExerciseType()
  window.UITranslate = function () {
    const language = LogEXSession.getLanguage()
    const langCallback = function () {
      controller.updateTexts()
    }
    loadLanguage(language, langCallback)
  }
  controller.initializeStepValidation()
  controller.initializeButtons()
  controller.initializeInput()
  controller.initializeLabels()
  controller.initializeRules(document.getElementById('rule'))
  controller.setExampleExercises()
  controller.bindExampleExercises()
}

ready(setUp)

class TwoWayController extends LogExController {
  constructor () {
    super()

    this.exerciseGenerator = new TwoWayExerciseGenerator()
    this.exerciseSolver = new TwoWayExerciseSolver()
    this.exerciseValidator = new TwoWayExerciseValidator()
    this.syntaxValidator = new SyntaxValidator()
    this.exerciseType = 'logeq'
    this.proofDirection = null
    this.newFormulaPopover1 = null
    this.newFormulaPopover2 = null

    $('#generate-exercise').click(function () {
      if (config.randomExercises) {
        this.generateExercise()
      }
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
    const newFormula1Options = {
      id: 2,
      characters: this.characterOptions
    }
    const newFormula2Options = {
      id: 3,
      characters: this.characterOptions
    }
    this.formulaPopover = new FormulaPopover(document.getElementById('formula'), document.getElementById('two-way-input'), formulaOptions)
    this.newFormulaPopover1 = new FormulaPopover(document.getElementById('new-formula-1'), document.getElementById('new-input-1'), newFormula1Options)
    this.newFormulaPopover2 = new FormulaPopover(document.getElementById('new-formula-2'), document.getElementById('new-input-2'), newFormula2Options)
  }

  /**
        Initializes all buttons and label to correct language
     */
  initializeLabels () {
    window.UITranslate()
  }

  updateTexts () {
    super.updateTexts()
    document.getElementById('exercise-title').innerHTML = translate('twoWay.title')
    if (this.exercise !== null) {
      document.getElementById('instruction').innerHTML = translate('twoWay.instruction.exercise', {
        topFormula: this.exercise.equation.formula1katex,
        bottomFormula: this.exercise.equation.formula2katex,
        title: {
          key: this.exercise.titleKey,
          params: this.exercise.titleParams
        }
      })
    } else if (document.getElementById('new-exercise-container').style.display === '') {
      document.getElementById('instruction').innerHTML = translate('twoWay.instruction.create')
    } else {
      document.getElementById('instruction').innerHTML = translate('twoWay.instruction.begin')
    }
    document.getElementById('header-direction').innerHTML = translate('shared.header.direction')

    this.initializeRules(document.getElementById('rule'))
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
  useExercise (exnr, displayNumber) {
    const properties = {
      stepValidation: true,
      titleKey: 'shared.exerciseName.example',
      titleParams: {
        number: displayNumber
      }
    }

    super.useExercise(exnr, properties)
  }

  /**
        Generates an exercise.
     */
  generateExercise (difficulty) {
    const properties = {
      stepValidation: true,
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
    document.getElementById('instruction').innerHTML = translate('twoWay.instruction.create')
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

    const formula1 = document.getElementById('new-formula-1').value
    const formula2 = document.getElementById('new-formula-2').value
    const formula = `${formula1}==${formula2}`

    if (!this.validateFormula(document.getElementById('new-formula-1'), this.newExerciseAlert)) {
      return
    }

    if (!this.validateFormula(document.getElementById('new-formula-2'), this.newExerciseAlert)) {
      return
    }

    this.disableUI(true)
    this.dismissAlert()
    this.exercise = new TwoWayExercise(formula, exerciseMethod, properties)
    this.exerciseGenerator.create(exerciseMethod, formula, properties, this.showExercise.bind(this), this.onErrorCreatingExercise.bind(this))
  }

  /**
        Handles the error that an exercise can not be created
     */
  onErrorCreatingExercise () {
    this.exercise = null
    this.disableUI(false)
    this.setErrorLocation('new-formula-1')
    this.newExerciseAlert.updateAlert('shared.error.creatingExercise', null, 'error')
  }

  /**
        Handles the event that an exercise is validated after the user has chosen to create a new exercise
     */
  /* this.onNewExerciseValidated = function (solution) {

        this.clearErrors();
        var lastStep = solution.getCurrentStep();
        if (lastStep.equation.formula1 !== lastStep.equation.formula2) {
            // de nieuwe oefening kan niet opgelost worden door de strategie
            this.showErrorToolTip($('#equivsign'), Resources.getSpecificMessage(LogEXSession.getLanguage(), "not-equivalent"));
            $('#equivsign').attr("src", "img/equivsignerr.png");

            return;
        }

        this.onExerciseGenerated(this.exercise);
    }; */

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

    stepRow = exerciseStepTable.lastElementChild
    while (true) {
      if (stepRow.classList.contains('exercise-step')) {
        exerciseStepTable.removeChild(stepRow)
        stepRow = exerciseStepTable.lastElementChild
      } else {
        break
      }
    }

    document.getElementById('header-actions').style.display = ''

    // Insert first row
    this.insertStep(this.exercise.steps.topSteps[0], false)
    this.insertStep(this.exercise.steps.bottomSteps[0], false)

    document.getElementById('instruction').innerHTML = translate('twoWay.instruction.exercise', {
      topFormula: this.exercise.equation.formula1katex,
      bottomFormula: this.exercise.equation.formula2katex,
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

    this.disableUI(false)

    if (config.displayDerivationButton) {
      $('#solve-exercise').show()
    }

    // When using hotkeys focus on formula field must be reset
    if ((LogEXSession.getStudentId() > 0)) {
      $('#formula').blur()
      $('#formula').focus()
    }

    // Reset rule value at start
    document.getElementById('rule').selectedIndex = 0

    // doh: zorg dat regelverantwoording niet undefined kan zijn
    this.exercise.usesRuleJustification = true // $('#rule-switch').bootstrapSwitch('state')

    // rvl: Check if rule justification is needed
    // if (this.exercise.usesRuleJustification) {
    //   $('#rule').show()
    // } else {
    //   $('#rule').hide()
    // }

    document.getElementById('step-validation-switch').disabled = false // $('#step-validation-switch').bootstrapSwitch('disabled', true) // true || false
    this.setProofDirection(null)
  }

  /**
        Handles the event that an exercise is generated
     */
  // onExerciseGenerated (exercise) {
  //   this.exercise = exercise
  //   this.clearErrors()

  //   $('#exercise-steps').show()
  //   if ($(NEW_EXERCISE_CONTENT)) {
  //     $(NEW_EXERCISE_CONTENT).remove()
  //   }

  //   // document.getElementById('exercise-left-formula').innerHTML = exercise.equation.formula1katex
  //   // document.getElementById('exercise-right-formula').innerHTML = exercise.equation.formula2katex

  //   // $(FORMULA1).val(exercise.equation.formula1)
  //   // // $(FORMULA1).kbinput('setPreviousValue', $(FORMULA1).val())
  //   // $('#formula1original').val($(FORMULA1).val())
  //   // $(FORMULA2).val(exercise.equation.formula2)
  //   // // $(FORMULA2).kbinput('setPreviousValue', $(FORMULA2).val())
  //   // $('#formula2original').val($(FORMULA2).val())
  //   // this.exercise = exercise

  //   // this.disableUI(false)
  //   // $('#active-step-top').show()
  //   // $('#active-step-bottom').show()
  //   // $(EXERCISE).show()
  //   // $('#exercise-steps').show()
  //   // if (config.displayDerivationButton) {
  //   //   $('#solve-exercise').show()
  //   // }
  //   // $('#validate-exercise').show()
  //   // $(EXERCISE_RIGHT_FORMULA).show()
  //   // $('#bottom').show()
  //   // $('#equivsign').attr('src', 'img/equivsign.png')

  //   // // When using hotkeys focus on formula field must be reset
  //   // $(FORMULA1).blur()
  //   // $('#formula2').blur()
  //   // $(FORMULA1).focus()

  //   // // Reset rules value at start
  //   // $(RULE_LISTBOX_TOP).val('')
  //   // $(RULE_LISTBOX_BOTTOM).val('')

  //   // document.getElementById('step-validation-switch').checked = true

  //   // $('#active-step-bottom').hide()
  //   // $('#active-step-top').hide()
  //   // $('#add-step-bottom-button').show()
  //   // $('#add-step-top-button').show()
  // }

  /**
        Handles the error that an exercise can not generated
     */
  onErrorGeneratingExercise () {
    this.disableUI(false)
    this.showErrorToolTip($('#new-exercise-dropdown'), Resources.getSpecificMessage(LogEXSession.getLanguage(), 'error-generating-exercise'), 'right')
  }

  showSolution () {
    window.open('twowaysolution.html?formula=' + this.exercise.equation.getText() + '&exerciseType=' + this.exercise.type, '_blank', 'location=no,width=1020,height=600,status=no,toolbar=no')
  }

  showNextStep () {
    this.disableUI(true)
    this.exerciseSolver.solveNextStep(this.exercise, this.onNextStepSolved.bind(this), this.onErrorSolvingNextStep.bind(this))
  }

  showNextStepWithoutStepValidation () {
    if (this.dummyExercise.getCurrentStep().isValid || this.dummyExercise.getCurrentStep().isCorrect) {
      this.exerciseSolver.solveNextStep(this.exercise, this.onNextStepSolved.bind(this), this.onErrorSolvingNextStep.bind(this))

      // this.exerciseSolver.solveNextStep(this.exercise, this.this.GetStepsRemaining, this.onErrorSolvingNextStep);
    } else {
      this.disableUI(false)
      this.showErrorToolTip($('#show-next-step'), Resources.getSpecificMessage(LogEXSession.getLanguage(), 'error-solving-next-stap-inv'))
    }
  }

  /**
        Handles the event that the next step of an exercise is solved
        @param {TwoWayStep} nextStep - The next step
     */
  onNextStepSolved (nextStep) {
    if (nextStep.isTopStep) {
      this.exercise.steps.pushTopStep(nextStep)
    } else {
      this.exercise.steps.pushBottomStep(nextStep)
    }

    this.insertStep(nextStep, true)
    this.disableUI(false)
  }

  /**
        Handles the error that the next step can not be solved
     */
  onErrorSolvingNextStep () {
    this.showErrorToolTip($('#show-next-step'), Resources.getSpecificMessage(LogEXSession.getLanguage(), 'error-solving-next-step'))
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
    console.log(nextOneWayStep)
    const currentTopFormula = this.exercise.steps.topSteps[this.exercise.steps.topSteps.length - 1].formula.replaceAll(' ', '')
    let newFormula
    let oldFormula
    if (nextOneWayStep.formula.split('==')[0].replaceAll(' ', '') === currentTopFormula) {
      // new bottom step
      oldFormula = this.exercise.steps.bottomSteps[this.exercise.steps.bottomSteps.length - 1].formula.replaceAll(' ', '')
      newFormula = nextOneWayStep.formula.split('==')[1].replaceAll(' ', '')
    } else {
      // new top step
      oldFormula = this.exercise.steps.topSteps[this.exercise.steps.topSteps.length - 1].formula.replaceAll(' ', '')
      newFormula = nextOneWayStep.formula.split('==')[0].replaceAll(' ', '')
    }
    console.log(oldFormula)
    console.log(newFormula)
    const formulaDiff = showdiff(oldFormula, newFormula).printKatexStyled()
    this.updateAlert('shared.hint.full', { rule: Rules[nextOneWayStep.rule], formula: formulaDiff }, 'hint', 'shared.hint.autoStep', this.showNextStep.bind(this))
  }

  /**
        Validates a step

     */
  validateStep () {
    const newFormula = document.getElementById('formula').value

    const ruleKey = this.getSelectedRuleKey()
    if (ruleKey === null && this.exercise.usesStepValidation) {
      this.setErrorLocation('rule')
      this.updateAlert('shared.error.noRule', null, 'error')
      return false
    }

    if (this.proofDirection === 'down' && newFormula === this.exercise.steps.getCurrentTopStep().formula) {
      this.setErrorLocation('formula')
      this.updateAlert('shared.error.notChanged', null, 'error')
      return false
    }

    if (this.proofDirection === 'up' && newFormula === this.exercise.steps.getCurrentBottomStep().formula) {
      this.setErrorLocation('formula')
      this.updateAlert('shared.error.notChanged', null, 'error')
      return false
    }

    if (this.exercise.usesStepValidation && !this.validateFormula(document.getElementById('formula'), this.exerciseAlert)) {
      return false
    }

    this.disableUI(true)
    this.clearErrors()

    let newStep = null
    let previousStep = null
    if (this.proofDirection === 'down') {
      newStep = new TwoWayStep(newFormula, ruleKey, 'top')
      previousStep = this.exercise.steps.getCurrentTopStep()
      this.exercise.steps.pushTopStep(newStep)
    } else {
      newStep = new TwoWayStep(newFormula, ruleKey, 'bottom')
      previousStep = this.exercise.steps.getCurrentBottomStep()
      this.exercise.steps.pushBottomStep(newStep)
    }

    if (this.exercise.usesStepValidation) {
      this.exerciseValidator.validateStep(this.exercise, this.exercise.usesRuleJustification, previousStep, newStep, this.onStepValidated.bind(this), this.onErrorValidatingStep.bind(this))
    } else {
      this.onStepValidated(newStep)
    }
  }

  checkCompleted () {
    if (!this.exercise.steps.isComplete()) {
      return
    }

    const elements = document.getElementsByClassName('step-actions')
    for (const element of elements) {
      element.style.display = 'none'
    }
    document.getElementById('header-actions').style.display = 'none'

    const arrow = katex.renderToString('\\Leftrightarrow', {
      throwOnError: false
    })

    const alertParams = {
      beginFormula: this.exercise.equation.formula1katex,
      endFormula: this.exercise.equation.formula2katex,
      arrow: arrow
    }
    this.exercise.isReady = true
    this.updateAlert('twoWay.solution', alertParams, 'complete')
    this.setProofDirection('complete')
  }

  getCurrentStep () {
    if (this.proofDirection === 'down') {
      return this.exercise.steps.topSteps[this.exercise.steps.topSteps.length - 1]
    } else {
      return this.exercise.steps.bottomSteps[this.exercise.steps.bottomSteps.length - 1]
    }
  }

  removeCurrentStep () {
    if (this.proofDirection === 'down') {
      return this.exercise.steps.topSteps.pop()
    } else {
      return this.exercise.steps.bottomSteps.pop()
    }
  }

  onExerciseValidated () {
    let i = 0
    let isReady = false
    let completelyCorrect = true

    this.reset()

    this.onExerciseGenerated(this.exercise)

    $.each(this.exercise.steps.steps, function () {
      if (this.isTopStep || this.isBottomStep) {
        let rule = ''
        let stepTemplate
        let error = ''

        if (this.isTopStep) {
          stepTemplate = $('#exercise-top-step-template')
        } else {
          stepTemplate = $('#exercise-bottom-step-template')
        }

        if (this.rule !== undefined && this.rule !== '') {
          rule = Resources.getRule(LogEXSession.getLanguage(), this.rule)
        }

        if (i > 0 && !this.isValid && completelyCorrect === true) {
          completelyCorrect = false
        }

        if (!this.isSyntaxValid && this.exercise.usesStepValidation) {
          error = Resources.getInvalidFormulaMessage()
        } else if (!this.isRuleValid && this.exercise.usesStepValidation) {
          error = Resources.getSpecificMessage(LogEXSession.getLanguage(), 'wrongrule')
        } else if (this.isCorrect && this.exercise.usesStepValidation) {
          error = Resources.getSpecificMessage(LogEXSession.getLanguage(), 'correctnotval')
        } else if (this.isSimilar && this.exercise.usesStepValidation) {
          error = Resources.getSpecificMessage(LogEXSession.getLanguage(), 'similar')
        } else if (this.isBuggy && this.exercise.usesStepValidation) {
          error = Resources.getMessageForBuggyRule(LogEXSession.getLanguage(), this.buggyRule)
        }

        const exerciseStepHtml = stepTemplate.render({
          rule: rule,
          leftformula: this.equation.formula1katex,
          rightformula: this.equation.formula2katex,
          canDelete: true,
          isWrong: !this.isValid || this.isCorrect,
          hasRule: this.rule !== undefined,
          step: i,
          stepValidation: false,
          error: error,
          stepsremaining: ''
        })

        if (this.isTopStep) {
          $('#active-step-top').before(exerciseStepHtml)
        } else {
          $('#active-step-bottom').after(exerciseStepHtml)
        }

        if (this.isReady && !isReady && completelyCorrect === true) {
          isReady = true
          this.insertLastStep(this)
        }

        if (!this.isRuleValid && i > 0) {
          // this.initializeRules($('#rule' & i))
        }
      }
      i++
    })

    this.disableUI(false)

    if (!isReady) {
      this.showErrorToolTip($('#validate-exercise'), Resources.getSpecificMessage(LogEXSession.getLanguage(), 'incomplete'))
    }
  }

  /**
        Checks if the exercise is ready
     */
  setReady () {
    const step = this.getCurrentStep()
    const state = [this.exercise.type, step.strategyStatus, step.equation.getText(), step.strategyLocation]
    if (!step.isReady) {
      step.isReady = step.equation.getEquationIsSolved()
    }

    // Log the ready event
    if (step.isReady) {
      IdeasServiceProxy.log(state, 'Ready: true (no call)')
    }
  }

  /**
        Handles the event that a step is validated

     */
  onStepValidated (currentStep) {
    this.clearErrors()
    document.getElementById('formula').value = currentStep.formula

    document.getElementById('step-validation-switch').checked = false

    let message = null
    let errorLocation = null
    if (!currentStep.isValid && this.exercise.usesStepValidation) {
      message = 'shared.error.wrongStep'
      if (currentStep.isTopStep) {
        this.exercise.steps.topSteps.pop()
      } else {
        this.exercise.steps.bottomSteps.pop()
      }

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
    } else {
      this.insertStep(currentStep, true)
      this.exercise.isReady = currentStep.isReady

      // bij auto step is formula nog niet goed gevuld
      document.getElementById('formula').value = currentStep.formula

      this.disableUI(false)

      //    Reset rule value after valid step
      document.getElementById('rule').selectedIndex = 0
    }
  }

  /**
        Handles the error that the step can not be validated
     */
  onErrorValidatingStep (isTopStep) {
    this.disableUI(false)
    this.setErrorLocation('validate-step')
    this.updateAlert('shared.error.validatingStep', null, 'error')
  }

  setProofDirection (direction) {
    this.proofDirection = direction
    const topBuffer = document.getElementById('empty-top-step')
    const bottomBuffer = document.getElementById('empty-bottom-step')
    const activeStep = document.getElementById('active-step')
    const activeArrow = document.getElementById('active-arrow')
    const activeEquiv = document.getElementById('active-equiv')

    if (direction === 'down') {
      topBuffer.style.display = 'none'
      bottomBuffer.style.display = ''
      activeStep.style.display = ''
      activeArrow.innerHTML = '<i class="fas fa-arrow-down"></i>'
      activeEquiv.style.display = ''
      this.formulaPopover.setText(this.exercise.steps.topSteps[this.exercise.steps.topSteps.length - 1].formula)
      this.formulaPopover.previousValue = this.exercise.steps.topSteps[this.exercise.steps.topSteps.length - 1].formula
    }
    if (direction === 'up') {
      topBuffer.style.display = ''
      bottomBuffer.style.display = 'none'
      activeStep.style.display = ''
      activeArrow.innerHTML = '<i class="fas fa-arrow-up"></i>'
      activeEquiv.style.display = 'none'
      this.formulaPopover.setText(this.exercise.steps.bottomSteps[this.exercise.steps.bottomSteps.length - 1].formula)
      this.formulaPopover.previousValue = this.exercise.steps.bottomSteps[this.exercise.steps.bottomSteps.length - 1].formula
    }
    if (direction === 'complete') {
      topBuffer.style.display = 'none'
      bottomBuffer.style.display = 'none'
      activeStep.style.display = 'none'
    }
    if (direction === null) {
      topBuffer.style.display = 'none'
      bottomBuffer.style.display = ''
      activeStep.style.display = 'none'
    }
  }

  /**
        Inserts a proof step

        @param {ProofStep} step - The proof step
        @param {Boolean} canDelete - True if the proof step can be deleted, false otherwise
     */
  insertStep (step, canDelete) {
    this.dismissAlert()

    const exerciseStep = document.createElement('tr')
    if (step.isTopStep) {
      this.setProofDirection('down')
      exerciseStep.classList.add('exercise-top-step')
    } else {
      this.setProofDirection('up')
      exerciseStep.classList.add('exercise-bottom-step')
    }
    exerciseStep.classList.add('exercise-step')
    exerciseStep.setAttribute('number', step.number)
    exerciseStep.innerHTML = this.renderStep(step, canDelete)

    if (canDelete) {
      const deleteButton = exerciseStep.getElementsByClassName('delete-step')[0]
      deleteButton.addEventListener('click', function () {
        if (step.isTopStep) {
          this.removeTopStep(step.number)
        } else {
          this.removeBottomStep(step.number)
        }
      }.bind(this))
    }

    // Move Top down/Bottom up button
    if (step.isTopStep) {
      const topDownButton = document.getElementById('top-step')
      if (topDownButton) {
        topDownButton.parentNode.removeChild(topDownButton)
      }
      const topBuffer = document.getElementById('empty-top-step')
      topBuffer.insertAdjacentElement('beforebegin', exerciseStep)
    } else {
      const bottomUpButton = document.getElementById('bottom-step')
      if (bottomUpButton) {
        bottomUpButton.parentNode.removeChild(bottomUpButton)
      }
      const bottomBuffer = document.getElementById('empty-bottom-step')
      bottomBuffer.insertAdjacentElement('afterend', exerciseStep)
    }

    this.formulaPopover.previousValue = step.formula
    if (step.isTopStep) {
      document.getElementById('top-step').innerHTML = translate('twoWay.button.topDown')
      document.getElementById('top-step').addEventListener('click', function () {
        this.setProofDirection('down')
      }.bind(this))
    } else {
      document.getElementById('bottom-step').innerHTML = translate('twoWay.button.bottomUp')
      document.getElementById('bottom-step').addEventListener('click', function () {
        this.setProofDirection('up')
      }.bind(this))
    }

    this.checkCompleted()
  }

  renderStep (step, canDelete) {
    let rule = ''
    let arrow = null
    const stepTemplate = $.templates('#exercise-step-template')
    const ruleKey = Rules[step.rule]

    if (step.rule !== undefined) {
      rule = translate(ruleKey)
    }

    arrow = katex.renderToString('\\Leftrightarrow', {
      throwOnError: false
    })

    const exerciseStepHtml = stepTemplate.render({
      rule: rule,
      ruleKey: ruleKey,
      formula: step.formulaKatex,
      canDelete: canDelete,
      topStep: step.isTopStep,
      bottomStep: step.isBottomStep,
      basis: step === this.exercise.steps.topSteps[0] || step === this.exercise.steps.bottomSteps[0],
      step: step.number,
      arrow: arrow,
      stepValidation: true,
      ruleJustification: true
    })

    return exerciseStepHtml
  }

  /**
        Inserts the last proof step

        @param {TwoWayStep} step - The proof step
     */
  insertLastStep (step) {
    const stepTemplate = $('#exercise-last-step-template')
    const exerciseStepHtml = stepTemplate.render({
      leftformula: step.equation.formula1katex,
      rightformula: step.equation.formula2katex
    })

    $('#active-step-top').before(exerciseStepHtml)
    $('#active-step-top').hide()
    $('#active-step-bottom').hide()
    $('#bottom').hide()

    this.clearErrors()

    $('.remove-top-step').hide()
    $('.remove-bottom-step').hide()

    $('#active-step-top').hide()
    $('#active-step-bottom').hide()
    $('#add-step-top-button').hide()
    $('#add-step-bottom-button').hide()

    document.getElementById('step-validation-switch').checked = true
  }

  /**
        Removes the top steps, starting at the specified source index

        @param source - The source DOM element
     */
  removeTopStep (index) {
    if (index === 1) {
      // Don't remove base step
      return
    }

    const exerciseStepTable = document.getElementById('exercise-step-table')

    // Move top-down button
    const topDownButton = document.getElementById('top-step')
    for (let i = 0; i < exerciseStepTable.children.length; i++) {
      if (Number(exerciseStepTable.children[i].getAttribute('number')) === index - 1 && exerciseStepTable.children[i].classList.contains('exercise-top-step')) {
        const newTop = exerciseStepTable.children[i].getElementsByClassName('step-actions')[0]
        newTop.appendChild(topDownButton)
      }
    }

    for (let i = exerciseStepTable.children.length - 1; i >= 0; i--) {
      if (exerciseStepTable.children[i].getAttribute('number') >= index && exerciseStepTable.children[i].classList.contains('exercise-top-step')) {
        exerciseStepTable.removeChild(exerciseStepTable.children[i])
      }
    }
    this.exercise.steps.removeTopSteps(index - 1)
    if (this.proofDirection === 'down') {
      this.formulaPopover.previousValue = this.exercise.steps.topSteps[index - 2].formula
      this.formulaPopover.setText(this.exercise.steps.topSteps[index - 2].formula)
    }
  }

  retryFormula (source) {
    const index = source.attr('data-step')
    const editStep = this.exercise.steps.steps[index]

    if (editStep.isTopStep) {
      editStep.equation.formula1 = source.val()
    } else {
      editStep.equation.formula2 = source.val()
    }
  }

  retryRule (source) {
    const index = source.attr('data-step')
    const editStep = this.exercise.steps.steps[index]

    editStep.rule = source.val()
  }

  /**
        Removes the bottom steps, starting at the specified source index

        @param source - The source DOM element
     */
  removeBottomStep (index) {
    if (index === 1) {
      // Don't remove base step
      return
    }

    const exerciseStepTable = document.getElementById('exercise-step-table')

    // Move bottomUp button
    const bottomUpButton = document.getElementById('bottom-step')
    for (let i = 0; i < exerciseStepTable.children.length; i++) {
      if (Number(exerciseStepTable.children[i].getAttribute('number')) === index - 1 && exerciseStepTable.children[i].classList.contains('exercise-bottom-step')) {
        const newBottom = exerciseStepTable.children[i].getElementsByClassName('step-actions')[0]
        newBottom.appendChild(bottomUpButton)
      }
    }

    for (let i = exerciseStepTable.children.length - 1; i >= 0; i--) {
      if (exerciseStepTable.children[i].getAttribute('number') >= index && exerciseStepTable.children[i].classList.contains('exercise-bottom-step')) {
        exerciseStepTable.removeChild(exerciseStepTable.children[i])
      }
    }
    this.exercise.steps.removeBottomSteps(index - 1)
    if (this.proofDirection === 'up') {
      this.formulaPopover.previousValue = this.exercise.steps.bottomSteps[index - 2].formula
      this.formulaPopover.setText(this.exercise.steps.bottomSteps[index - 2].formula)
    }
  }

  changeStepValidation (stepValidation) {
    if (this.exercise) {
      this.exercise.usesStepValidation = stepValidation
    }
  }
}
