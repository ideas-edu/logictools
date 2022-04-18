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

import { FormulaPopover } from '../kbinput.js'

import { LogExController } from './LogExController.js'
import { LogEXSession } from '../logEXSession.js'
import { ExerciseTypes } from '../model/exerciseTypes.js'
import { TwoWayExerciseGenerator } from '../model/twoway/exerciseGenerator.js'
import { TwoWayExercise } from '../model/twoway/exercise.js'
import { TwoWayExerciseSolver } from '../model/twoway/exerciseSolver.js'
import { TwoWayExerciseValidator } from '../model/twoway/exerciseValidator.js'
import { TwoWayStep } from '../model/twoway/step.js'
import { SyntaxValidator } from '../model/syntaxValidator.js'
import { Rules } from '../model/rules.js'
import { showdiff } from '../showdiff.js'
import { translate, loadLanguage, translateElement, hasTranslation } from '../translate.js'

const $ = jsrender(null)

function ready (fn) {
  if (document.readyState !== 'loading') {
    fn()
  } else {
    document.addEventListener('DOMContentLoaded', fn)
  }
}

function setUp () {
  const controller = new TwoWayController()
  window.translate = loadLanguage
  window.controller = controller
  loadLanguage(LogEXSession.getLanguage())
  controller.initializeStepValidation()
  controller.initializeInput()
  controller.initializeRules(document.getElementById('rule'))
  controller.setExampleExercises()
}

ready(setUp)

class TwoWayController extends LogExController {
  constructor () {
    super()

    this.exerciseGenerator = new TwoWayExerciseGenerator(this.config)
    this.exerciseSolver = new TwoWayExerciseSolver(this.config)
    this.exerciseValidator = new TwoWayExerciseValidator(this.config)
    this.syntaxValidator = new SyntaxValidator()
    this.exerciseType = 'LOGEQ'
    this.proofDirection = null
    this.newFormulaPopover1 = null
    this.newFormulaPopover2 = null
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
        Get an example exercise.
     */
  useExercise (properties) {
    properties.stepValidation = true

    super.useExercise(properties)
  }

  /**
        Generates an exercise.
     */
  generateExercise (properties) {
    properties.stepValidation = true

    super.generateExercise(properties)
  }

  /**
        Shows the form for creating a new exercise
     */
  newExercise () {
    super.newExercise()
    translateElement(document.getElementById('instruction'), 'twoWay.instruction.create')
  }

  /**
        Creates a new exercise
     */

  createExercise () {
    const exerciseMethod = ExerciseTypes[this.exerciseType]
    const properties = {
      ruleJustification: document.getElementById('rule-switch').checked,
      stepValidation: true,
      titleKey: 'shared.exerciseName.user'
    }

    const formula1 = document.getElementById('new-formula-1').value
    const formula2 = document.getElementById('new-formula-2').value
    const context = {
      term: [formula1, {"type": "<=>", "motivation": "<GAP>"}, formula2],
      environment: {},
      location: []
    }

    if (!this.validateFormula(document.getElementById('new-formula-1'), this.newExerciseAlert)) {
      return
    }

    if (!this.validateFormula(document.getElementById('new-formula-2'), this.newExerciseAlert)) {
      return
    }

    this.disableUI(true)
    this.dismissAlert()
    this.exercise = new TwoWayExercise(context.term, exerciseMethod, properties)
    this.exerciseGenerator.create(exerciseMethod, context, properties, this.showExercise.bind(this), this.onErrorCreatingExercise.bind(this))
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

    translateElement(document.getElementById('instruction'), 'twoWay.instruction.exercise', {
      topFormula: this.exercise.steps.steps[0].formulaKatex,
      bottomFormula: this.exercise.steps.steps[this.exercise.steps.steps.length - 1].formulaKatex,
      title: {
        key: this.exercise.titleKey,
        params: this.exercise.titleParams
      }
    })

    document.getElementById('active-step').style.display = ''
    document.getElementById('show-solve-exercise').style.display = 'none'

    this.disableUI(false)

    // Reset rule value at start
    document.getElementById('rule').selectedIndex = 0

    this.exercise.usesRuleJustification = true

    document.getElementById('step-validation-switch').disabled = false
    this.setProofDirection(null)
    this.updateSteps()
  }

  showSolution () {
    window.open('twowaysolution.html?formula=' + this.exercise.equation.getText() + '&exerciseType=' + this.exercise.type + '&controller=' + this.exerciseType, '_blank', 'location=no,width=1020,height=600,status=no,toolbar=no')
  }

  showNextStep () {
    this.disableUI(true)
    this.exerciseSolver.solveNextStep(this.exercise, this.onNextStepSolved.bind(this), this.onErrorSolvingNextStep.bind(this))
  }

  /**
        Handles the event that the next step of an exercise is solved
        @param {TwoWayStep} nextStep - The next step
     */
  onNextStepSolved (newSteps) {
    this.exercise.steps.setSteps(this.exercise, newSteps)

    this.updateSteps()

    return true
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
    if (nextOneWayStep.stepEnvironment.direction === "0" && this.proofDirection === 'up') {
      this.updateAlert('twoWay.hint.useTopStep', null, 'hint')
      return
    }

    if (nextOneWayStep.stepEnvironment.direction === "1" && this.proofDirection === 'down') {
      this.updateAlert('twoWay.hint.useBottomStep', null, 'hint')
      return
    }

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
    let newFormula = null
    let afterGap = false
    for (const step of nextOneWayStep.term) {
      if (step.constructor === String) {
        newFormula = step
        if (afterGap) {
          break
        }
      } else {
        if (step.motivation !== '<GAP>') {
          continue
        }
        if (nextOneWayStep.stepEnvironment.direction === "0") {
          // new formula is above gap
          break
        } else {
          // new formula is below gap
          afterGap = true
          continue
        }
      }
    }

    newFormula = newFormula.replaceAll(' ', '')
    let oldFormula
    if (nextOneWayStep.stepEnvironment.direction === "0") {
      // new top step
      oldFormula = this.exercise.steps.topSteps[this.exercise.steps.topSteps.length - 1].formula.replaceAll(' ', '')
    } else {
      // new bottom step
      oldFormula = this.exercise.steps.bottomSteps[this.exercise.steps.bottomSteps.length - 1].formula.replaceAll(' ', '')
    }
    const formulaDiff = showdiff(oldFormula, newFormula, this.formulaOptions).printKatexStyled()
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

    // Deep copy exercise in case that the step is invalid
    const newExercise = new TwoWayExercise(
      this.exercise.steps.getObject(),
      this.exercise.exerciseType,
      {
        titleKey: this.exercise.titleKey,
        titleParams: this.exercise.titleParams
      }
    )

    let newStep = null
    let previousStep = null
    if (this.proofDirection === 'down') {
      newStep = newExercise.steps.insertTopStep()
      newStep.setTerm(newFormula)
      newStep.rule = ruleKey
    } else {
      newStep = newExercise.steps.insertBottomStep()
      newStep.setTerm(newFormula)
      newExercise.steps.steps[newStep.number+1].rule = ruleKey
    }

    if (this.exercise.usesStepValidation) {
      this.exerciseValidator.validateStep(this.exercise, newExercise, this.onStepValidated.bind(this), this.onErrorValidatingStep.bind(this))
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

    const alertParams = {
      beginFormula: this.exercise.steps.steps[0].formulaKatex,
      endFormula: this.exercise.steps.steps[this.exercise.steps.steps.length - 1].formulaKatex
    }
    this.exercise.isReady = true
    this.updateAlert('twoWay.solution', alertParams, 'complete')
    document.getElementById('show-solve-exercise').style.display = ''
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
    // not implemented
  }

  /**
        Handles the event that a step is validated

     */
  onStepValidated (newSet) {
    this.exercise.steps.setSteps(this.exercise, newSet)

    this.updateSteps()

    return true
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
    this.dismissAlert()
    const topBuffer = document.getElementById('empty-top-step')
    const bottomBuffer = document.getElementById('empty-bottom-step')
    const activeStep = document.getElementById('active-step')
    const activeArrow = document.getElementById('active-arrow')
    const activeEquiv = document.getElementById('active-equiv')

    if (direction === 'down') {
      this.exercise.direction = '0'
      topBuffer.style.display = 'none'
      bottomBuffer.style.display = ''
      activeStep.style.display = ''
      activeArrow.innerHTML = '<i class="fas fa-arrow-down"></i>'
      activeEquiv.style.display = ''
      this.formulaPopover.setText(this.exercise.steps.topSteps[this.exercise.steps.topSteps.length - 1].formula)
      this.formulaPopover.previousValue = this.exercise.steps.topSteps[this.exercise.steps.topSteps.length - 1].formula
    }
    if (direction === 'up') {
      this.exercise.direction = '1'
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
      this.exercise.direction = undefined
      topBuffer.style.display = 'none'
      bottomBuffer.style.display = ''
      activeStep.style.display = 'none'
    }
  }

  updateSteps () {
    this.clearErrors() // verwijder alle voorgaande foutmeldingen van het scherm

    const exerciseStepTable = document.getElementById('exercise-step-table')

    const topSteps = document.querySelectorAll('.exercise-top-step')
    for (const step of topSteps) {
      step.parentNode.removeChild(step)
    }
    const bottomSteps = document.querySelectorAll('.exercise-bottom-step')
    for (const step of bottomSteps) {
      step.parentNode.removeChild(step)
    }

    // exerciseStepTable.innerHTML = ''

    for (const step of this.exercise.steps.topSteps) {
      this.insertStep(step, step.number !== 0)
    }
    for (const step of this.exercise.steps.bottomSteps.reverse()) {
      this.insertStep(step, step.number !== this.exercise.steps.steps.length - 1)
    }
    this.disableUI(false)
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
      // this.setProofDirection('down')
      exerciseStep.classList.add('exercise-top-step')
    } else {
      // this.setProofDirection('up')
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
      translateElement(document.getElementById('top-step'), 'twoWay.button.topDown')
      document.getElementById('top-step').addEventListener('click', function () {
        this.setProofDirection('down')
      }.bind(this))
    } else {
      translateElement(document.getElementById('bottom-step'), 'twoWay.button.bottomUp')
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
    if (step.rule !== null) {
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
      bottomStep: !step.isTopStep,
      basis: step === this.exercise.steps.topSteps[0] || step === this.exercise.steps.bottomSteps[0],
      step: step.number,
      arrow: arrow,
      stepValidation: true,
      ruleJustification: true
    })

    return exerciseStepHtml
  }

  /**
        Removes the top steps, starting at the specified source index

        @param source - The source DOM element
     */
  removeTopStep (index) {
    if (index === 0) {
      // Don't remove base step
      return
    }

    this.exercise.steps.removeTopSteps(index)
    if (this.proofDirection === 'down') {
      this.formulaPopover.previousValue = this.exercise.steps.getCurrentTopStep().formula
      this.formulaPopover.setText(this.exercise.steps.getCurrentTopStep().formula)
    }

    this.exercise.prefix = '[]'
    this.updateSteps()
  }

  /**
        Removes the bottom steps, starting at the specified source index

        @param source - The source DOM element
     */
  removeBottomStep (index) {
    if (index === this.exercise.steps.steps.length - 1) {
      // Don't remove base step
      return
    }

    this.exercise.steps.removeBottomSteps(index)
    if (this.proofDirection === 'up') {
      this.formulaPopover.previousValue = this.exercise.steps.getCurrentBottomStep().formula
      this.formulaPopover.setText(this.exercise.steps.getCurrentBottomStep().formula)
    }
    this.exercise.prefix = '[]'
    this.updateSteps()
  }

  changeStepValidation (stepValidation) {
    if (this.exercise) {
      this.exercise.usesStepValidation = stepValidation
    }
  }
}
