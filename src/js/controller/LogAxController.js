import jsrender from 'jsrender'
import 'bootstrap'
import 'iframe-resizer'
import 'bootstrap/dist/css/bootstrap.min.css'
import '@fortawesome/fontawesome-free/js/fontawesome'
import '@fortawesome/fontawesome-free/js/solid'
import '@fortawesome/fontawesome-free/js/regular'
import '@fortawesome/fontawesome-free/js/brands'
import 'katex/dist/katex.min.css'
// import katex from 'katex'

import { FormulaPopover } from '../kbinput.js'

// import { IdeasServiceProxy } from '../model/ideasServiceProxy.js'
import { LogEXSession } from '../logEXSession.js'
import { LogAxExerciseGenerator } from '../model/logax/exerciseGenerator.js'
import { LogAxExerciseSolver } from '../model/logax/exerciseSolver.js'
import { LogAxExerciseValidator } from '../model/logax/exerciseValidator.js'
import { LogAxStep } from '../model/logax/step.js'
import { SyntaxValidator } from '../model/syntaxValidator.js'
// import { LogAxExercise } from '../model/logax/exercise.js'
import { ExerciseController } from './ExerciseController.js'
// import config from '../../../config.json'
import { translate, translateElement, loadLanguage, hasTranslation } from '../translate.js'

const $ = jsrender(null)

function ready (fn) {
  if (document.readyState !== 'loading') {
    fn()
  } else {
    document.addEventListener('DOMContentLoaded', fn)
  }
}

function setUp () {
  window.controller = new LogAxController()
  window.translate = loadLanguage
  loadLanguage(LogEXSession.getLanguage())
}

ready(setUp)

export class LogAxController extends ExerciseController {
  constructor () {
    super()
    this.ruleKey = null
    this.characterOptions = [
      {
        char: '¬',
        latex: '\\neg',
        triggers: ['-', 'n', '1', '`', '!', 'N']
      },
      {
        char: '→',
        latex: '\\rightarrow',
        triggers: ['i', '.', 'I'],
        spaces: true
      },
      {
        char: 'p',
        latex: 'p',
        triggers: ['P'],
        charStyled: '<i>p</i>'
      },
      {
        char: 'q',
        latex: 'q',
        triggers: ['Q'],
        charStyled: '<i>q</i>'
      },
      {
        char: 'r',
        latex: 'r',
        triggers: ['R'],
        charStyled: '<i>r</i>'
      },
      {
        char: 's',
        latex: 's',
        triggers: ['S'],
        charStyled: '<i>s</i>'
      },
      {
        char: '(',
        latex: '(',
        triggers: ['9']
      },
      {
        char: ')',
        latex: ')',
        triggers: ['0']
      },
      {
        char: ',',
        latex: ',',
        triggers: [',']
      }
    ]
    this.setExampleExercises()
    // this.bindExampleExercises()

    this.exerciseGenerator = new LogAxExerciseGenerator(this.config)
    this.exerciseSolver = new LogAxExerciseSolver(this.config)
    // validation
    this.exerciseValidator = new LogAxExerciseValidator(this.config)
    this.syntaxValidator = new SyntaxValidator()

    this.initializeRules(document.getElementById('rule'))
    this.initializeInput()

    document.getElementById('renumber-step').addEventListener('click', function () {
      this.renumberSteps()
    }.bind(this))

    document.getElementById('undo-step').addEventListener('click', function () {
      this.undoStep()
    }.bind(this))

    document.getElementById('redo-step').addEventListener('click', function () {
      this.redoStep()
    }.bind(this))

    document.getElementById('complete-exercise').addEventListener('click', function () {
      this.completeSolution()
    }.bind(this))
  }

  /**
        Creates the popover for the input of symbols
    */
  initializeInput () {
    const assumptionOptions = {
      id: 1,
      allowUndo: true,
      characters: this.characterOptions
    }
    const axiomAOptions1 = {
      id: 2,
      allowUndo: true,
      characters: this.characterOptions
    }
    const axiomAOptions2 = {
      id: 3,
      allowUndo: true,
      characters: this.characterOptions
    }
    const axiomBOptions1 = {
      id: 4,
      allowUndo: true,
      characters: this.characterOptions
    }
    const axiomBOptions2 = {
      id: 5,
      allowUndo: true,
      characters: this.characterOptions
    }
    const axiomBOptions3 = {
      id: 6,
      allowUndo: true,
      characters: this.characterOptions
    }
    const axiomCOptions1 = {
      id: 7,
      allowUndo: true,
      characters: this.characterOptions
    }
    const axiomCOptions2 = {
      id: 8,
      allowUndo: true,
      characters: this.characterOptions
    }
    const deductionOptions = {
      id: 9,
      allowUndo: true,
      characters: this.characterOptions
    }
    const goalPhiOptions = {
      id: 11,
      allowUndo: true,
      characters: this.characterOptions
    }
    const goalPsiOptions = {
      id: 12,
      allowUndo: true,
      characters: this.characterOptions
    }
    const newFormulaOptions = {
      id: 0,
      characters: this.characterOptions
    }
    this.assumptionPopover = new FormulaPopover(document.getElementById('assumption-formula-phi'), document.getElementById('assumption-phi-input'), assumptionOptions, this.applyReady.bind(this))
    this.axiomAPopover1 = new FormulaPopover(document.getElementById('axiom-a-formula-phi'), document.getElementById('axiom-a-phi-input'), axiomAOptions1, this.applyReady.bind(this))
    this.axiomAPopover2 = new FormulaPopover(document.getElementById('axiom-a-formula-psi'), document.getElementById('axiom-a-psi-input'), axiomAOptions2, this.applyReady.bind(this))
    this.axiomBPopover1 = new FormulaPopover(document.getElementById('axiom-b-formula-phi'), document.getElementById('axiom-b-phi-input'), axiomBOptions1, this.applyReady.bind(this))
    this.axiomBPopover2 = new FormulaPopover(document.getElementById('axiom-b-formula-psi'), document.getElementById('axiom-b-psi-input'), axiomBOptions2, this.applyReady.bind(this))
    this.axiomBPopover3 = new FormulaPopover(document.getElementById('axiom-b-formula-chi'), document.getElementById('axiom-b-chi-input'), axiomBOptions3, this.applyReady.bind(this))
    this.axiomCPopover1 = new FormulaPopover(document.getElementById('axiom-c-formula-phi'), document.getElementById('axiom-c-phi-input'), axiomCOptions1, this.applyReady.bind(this))
    this.axiomCPopover2 = new FormulaPopover(document.getElementById('axiom-c-formula-psi'), document.getElementById('axiom-c-psi-input'), axiomCOptions2, this.applyReady.bind(this))
    this.deductionPopover = new FormulaPopover(document.getElementById('deduction-formula-phi'), document.getElementById('deduction-phi-input'), deductionOptions, this.applyReady.bind(this))
    this.goalPhiPopover = new FormulaPopover(document.getElementById('goal-formula-phi'), document.getElementById('goal-phi-input'), goalPhiOptions, this.applyReady.bind(this))
    this.goalPsiPopover = new FormulaPopover(document.getElementById('goal-formula-psi'), document.getElementById('goal-psi-input'), goalPsiOptions, this.applyReady.bind(this))

    this.newFormulaPopover = new FormulaPopover(document.getElementById('new-formula'), document.getElementById('new-input'), newFormulaOptions)

    // apply
    const applyButton = document.getElementById('validate-step')
    applyButton.disabled = true

    const stepnrSelectors = document.querySelectorAll('.stepnr-select')
    for (const stepnrSelector of stepnrSelectors) {
      stepnrSelector.addEventListener('change', this.applyReady.bind(this))
    }
  }

  initializeRules (ruleElement) {
    super.initializeRules(ruleElement, this.config.rules.map(rule => rule.split('.')[3])
      .filter((value, index, self) => self.indexOf(value) === index)
      .map(baseRule => `logic.propositional.axiomatic.${baseRule}`))
    const subSelect = document.getElementById('subtype-select')

    ruleElement.addEventListener('change', function () {
      this.clearErrors()
      this.updateRuleVisibility(ruleElement, subSelect)
      this.applyReady()
    }.bind(this))

    subSelect.addEventListener('change', function () {
      this.clearErrors()
      this.updateRuleVisibility(ruleElement, subSelect)
      this.applyReady()
    }.bind(this))
  }

  updateRuleVisibility (ruleElement, subSelect) {
    const elements = document.querySelectorAll('[rule]')
    for (const element of elements) {
      element.style.display = 'none'
    }

    const baseRule = ruleElement.selectedOptions[0].getAttribute('translate-key').substring(5) // Remove 'rule.'
    const simpleRule = baseRule.split('.')[baseRule.split('.').length - 1]

    if (simpleRule !== 'selectRule') {
      document.getElementById('rule-definition-row').style.display = ''
      translateElement(document.getElementById('rule-definition'), `logax.rule.${simpleRule}.def`)
    } else {
      document.getElementById('rule-definition-row').style.display = 'none'
    }

    let rule = baseRule

    if (this.config.rules.includes(`${baseRule}.forward`)) {
      document.getElementById('subtype-select-row').style.display = 'none'
    } else {
      if (this.config.rules.includes(`${baseRule}.close`)) {
        document.getElementById('subtype-select-row').style.display = ''
        rule = baseRule + (subSelect.selectedIndex === 1 ? '.close' : '')
      } else {
        document.getElementById('subtype-select-row').style.display = 'none'
      }
    }

    this.ruleKey = rule

    const selectedElements = document.querySelectorAll(`[rule='${rule}']`)
    for (const element of selectedElements) {
      element.style.display = ''
    }
  }

  /**
    */
  showExercise () {
    document.getElementById('exercise-container').style.display = ''
    document.getElementById('rule-container').style.display = ''
    document.getElementById('completed-rule-container').style.display = 'none'
    document.getElementById('new-exercise-container').style.display = 'none'
    document.getElementById('undo-step').disabled = true
    document.getElementById('redo-step').disabled = true
    this.clearErrors()

    // Remove old rows
    const exerciseStepTable = document.getElementById('exercise-step-table')
    let stepRow = exerciseStepTable.firstElementChild
    while (true) {
      if (stepRow && stepRow.classList.contains('exercise-step')) {
        exerciseStepTable.removeChild(stepRow)
        stepRow = exerciseStepTable.firstElementChild
      } else {
        break
      }
    }
    document.getElementById('header-actions').style.display = ''

    translateElement(document.getElementById('instruction'), 'logax.instruction.exercise', {
      theorem: this.exercise.theoremKatex,
      title: {
        key: this.exercise.titleKey,
        params: this.exercise.titleParams
      }
    })
    this.disableUI(false)

    // Insert first step
    this.insertStep(this.exercise.steps.steps[0], false)
  }

  showSolution () {
    const steps = [{
      term: this.exercise.theorem,
      number: 1000
    }]
    window.open('logaxsolution.html?formula=' + encodeURIComponent(JSON.stringify(steps)) + '&exerciseType=' + this.exercise.type + '&controller=' + this.exerciseType, '_blank', 'location=no,width=1020,height=600,status=no,toolbar=no')
  }

  completeSolution () {
    window.open('logaxsolution.html?formula=' + encodeURIComponent(JSON.stringify(this.exercise.steps.getObject())) + '&exerciseType=' + this.exercise.type + '&controller=' + this.exerciseType, '_blank', 'location=no,width=1020,height=600,status=no,toolbar=no')
  }

  getNewStep () {
    const rule = this.ruleKey

    switch (rule) {
      case 'logic.propositional.axiomatic.assumption': {
        const newFormula = document.getElementById('assumption-formula-phi')
        return {
          environment: {
            phi: LogAxStep.convertToText(newFormula.value)
          },
          rule: rule
        }
      }
      case 'logic.propositional.axiomatic.assumption.close': {
        const stepnr = document.getElementById('assumption-select-stepnr')
        return {
          environment: {
            n: stepnr.value
          },
          rule: rule
        }
      }
      case 'logic.propositional.axiomatic.axiom-a': {
        const phi = document.getElementById('axiom-a-formula-phi')
        const psi = document.getElementById('axiom-a-formula-psi')
        return {
          environment: {
            phi: LogAxStep.convertToText(phi.value),
            psi: LogAxStep.convertToText(psi.value)
          },
          rule: rule
        }
      }
      case 'logic.propositional.axiomatic.axiom-a.close': {
        const stepnr = document.getElementById('axiom-a-select-stepnr')
        return {
          environment: {
            n: stepnr.value
          },
          rule: rule
        }
      }
      case 'logic.propositional.axiomatic.axiom-b': {
        const phi = document.getElementById('axiom-b-formula-phi')
        const psi = document.getElementById('axiom-b-formula-psi')
        const chi = document.getElementById('axiom-b-formula-chi')
        return {
          environment: {
            phi: LogAxStep.convertToText(phi.value),
            psi: LogAxStep.convertToText(psi.value),
            chi: LogAxStep.convertToText(chi.value)
          },
          rule: rule
        }
      }
      case 'logic.propositional.axiomatic.axiom-b.close': {
        const stepnr = document.getElementById('axiom-b-select-stepnr')
        return {
          environment: {
            n: stepnr.value
          },
          rule: rule
        }
      }
      case 'logic.propositional.axiomatic.axiom-c': {
        const phi = document.getElementById('axiom-c-formula-phi')
        const psi = document.getElementById('axiom-c-formula-psi')
        return {
          environment: {
            phi: LogAxStep.convertToText(phi.value),
            psi: LogAxStep.convertToText(psi.value)
          },
          rule: rule
        }
      }
      case 'logic.propositional.axiomatic.axiom-c.close': {
        const stepnr = document.getElementById('axiom-c-select-stepnr')
        return {
          environment: {
            n: stepnr.value
          },
          rule: rule
        }
      }
      case 'logic.propositional.axiomatic.modusponens': {
        const stepnr1 = document.getElementById('modusponens-select-stepnr-1')
        const stepnr2 = document.getElementById('modusponens-select-stepnr-2')
        const stepnr3 = document.getElementById('modusponens-select-stepnr-3')
        return {
          environment: {
            n1: stepnr1.value,
            n2: stepnr2.value,
            n3: stepnr3.value
          },
          rule: rule
        }
      }
      case 'logic.propositional.axiomatic.deduction': {
        const stepnr1 = document.getElementById('deduction-select-stepnr-1')
        const phi = document.getElementById('deduction-formula-phi')
        const stepnr2 = document.getElementById('deduction-select-stepnr-2')

        if (stepnr1.value !== '' && phi.value !== '') {
          return {
            environment: {
              n: stepnr1.value,
              phi: LogAxStep.convertToText(phi.value)
            },
            rule: `${rule}.forward`
          }
        }

        if (phi.value !== '' && stepnr2.value !== '') {
          return {
            environment: {
              n: stepnr2.value,
              phi: LogAxStep.convertToText(phi.value)
            },
            rule: `${rule}.backward`
          }
        }

        if (stepnr1.value !== '' && stepnr2.value !== '') {
          return {
            environment: {
              n1: stepnr1.value,
              n2: stepnr2.value
            },
            rule: `${rule}.close`
          }
        }
        return
      }
      case 'logic.propositional.axiomatic.goal': {
        const phi = document.getElementById('goal-formula-phi')
        const psi = document.getElementById('goal-formula-psi')
        const stepnr = document.getElementById('goal-stepnr')

        if (stepnr.value === '') {
          return {
            environment: {
              st: `${LogAxStep.convertToText(phi.value)} |- ${LogAxStep.convertToText(psi.value)}`
            },
            rule: `${rule}1`
          }
        } else {
          return {
            environment: {
              n: stepnr.value,
              st: `${LogAxStep.convertToText(phi.value)} |- ${LogAxStep.convertToText(psi.value)}`
            },
            rule: rule
          }
        }
      }
    }
  }

  disableUI (disable) {
    super.disableUI(disable)
    this.applyReady()
  }

  applyReady () {
    const rule = this.ruleKey
    const applyButton = document.getElementById('validate-step')
    applyButton.disabled = true

    switch (rule) {
      case 'logic.propositional.axiomatic.assumption': {
        const newFormula = document.getElementById('assumption-formula-phi')
        if (newFormula.value !== '') {
          applyButton.disabled = false
        }
        break
      }
      case 'logic.propositional.axiomatic.assumption.close': {
        const stepnr = document.getElementById('assumption-select-stepnr')
        if (stepnr.value !== '') {
          applyButton.disabled = false
        }
        break
      }
      case 'logic.propositional.axiomatic.axiom-a': {
        const phi = document.getElementById('axiom-a-formula-phi')
        const psi = document.getElementById('axiom-a-formula-psi')
        if (phi.value !== '' && psi.value !== '') {
          applyButton.disabled = false
        }
        break
      }
      case 'logic.propositional.axiomatic.axiom-a.close': {
        const stepnr = document.getElementById('axiom-a-select-stepnr')
        if (stepnr.value !== '') {
          applyButton.disabled = false
        }
        break
      }
      case 'logic.propositional.axiomatic.axiom-b': {
        const phi = document.getElementById('axiom-b-formula-phi')
        const psi = document.getElementById('axiom-b-formula-psi')
        const chi = document.getElementById('axiom-b-formula-chi')
        if (phi.value !== '' && psi.value !== '' && chi.value !== '') {
          applyButton.disabled = false
        }
        break
      }
      case 'logic.propositional.axiomatic.axiom-b.close': {
        const stepnr = document.getElementById('axiom-b-select-stepnr')
        if (stepnr.value !== '') {
          applyButton.disabled = false
        }
        break
      }
      case 'logic.propositional.axiomatic.axiom-c': {
        const phi = document.getElementById('axiom-c-formula-phi')
        const psi = document.getElementById('axiom-c-formula-psi')
        if (phi.value !== '' && psi.value !== '') {
          applyButton.disabled = false
        }
        break
      }
      case 'logic.propositional.axiomatic.axiom-c.close': {
        const stepnr = document.getElementById('axiom-c-select-stepnr')
        if (stepnr.value !== '') {
          applyButton.disabled = false
        }
        break
      }
      case 'logic.propositional.axiomatic.modusponens': {
        const stepnr1 = document.getElementById('modusponens-select-stepnr-1')
        const stepnr2 = document.getElementById('modusponens-select-stepnr-2')
        const stepnr3 = document.getElementById('modusponens-select-stepnr-3')

        if (stepnr1.value !== '' && stepnr2.value !== '' && stepnr3.value !== '') {
          applyButton.disabled = false
        }
        break
      }
      case 'logic.propositional.axiomatic.deduction': {
        const stepnr1 = document.getElementById('deduction-select-stepnr-1')
        const phi = document.getElementById('deduction-formula-phi')
        const stepnr2 = document.getElementById('deduction-select-stepnr-2')

        if (stepnr1.value !== '' && phi.value !== '') {
          applyButton.disabled = false
        }

        if (phi.value !== '' && stepnr2.value !== '') {
          applyButton.disabled = false
        }

        if (stepnr1.value !== '' && stepnr2.value !== '') {
          applyButton.disabled = false
        }

        stepnr2.disabled = (phi.value !== '')
        phi.disabled = (stepnr2.value !== '')

        break
      }
      case 'logic.propositional.axiomatic.goal': {
        const phi = document.getElementById('goal-formula-phi')
        const psi = document.getElementById('goal-formula-psi')

        if (phi.value !== '' && psi.value !== '') {
          applyButton.disabled = false
        }
        break
      }
    }
  }

  validateFormulas () {
    const rule = this.ruleKey

    switch (rule) {
      case 'logic.propositional.axiomatic.assumption': {
        const phi = document.getElementById('assumption-formula-phi')
        return this.validateFormula(phi, this.exerciseAlert)
      }
      case 'logic.propositional.axiomatic.assumption.close': {
        return true
      }
      case 'logic.propositional.axiomatic.axiom-a': {
        const phi = document.getElementById('axiom-a-formula-phi')
        const psi = document.getElementById('axiom-a-formula-psi')

        if (this.validateFormula(phi, this.exerciseAlert)) {
          return this.validateFormula(psi, this.exerciseAlert)
        } else {
          return false
        }
      }
      case 'logic.propositional.axiomatic.axiom-a.close': {
        return true
      }
      case 'logic.propositional.axiomatic.axiom-b': {
        const phi = document.getElementById('axiom-b-formula-phi')
        const psi = document.getElementById('axiom-b-formula-psi')
        const chi = document.getElementById('axiom-b-formula-chi')

        if (this.validateFormula(phi, this.exerciseAlert)) {
          if (this.validateFormula(psi, this.exerciseAlert)) {
            return this.validateFormula(chi, this.exerciseAlert)
          } else {
            return false
          }
        } else {
          return false
        }
      }
      case 'logic.propositional.axiomatic.axiom-b.close': {
        return true
      }
      case 'logic.propositional.axiomatic.axiom-c': {
        const phi = document.getElementById('axiom-c-formula-phi')
        const psi = document.getElementById('axiom-c-formula-psi')

        if (this.validateFormula(phi, this.exerciseAlert)) {
          return this.validateFormula(psi, this.exerciseAlert)
        } else {
          return false
        }
      }
      case 'logic.propositional.axiomatic.axiom-c.close': {
        return true
      }
      case 'logic.propositional.axiomatic.modusponens': {
        return true
      }
      case 'logic.propositional.axiomatic.deduction': {
        const stepnr1 = document.getElementById('deduction-select-stepnr-1')
        const phi = document.getElementById('deduction-formula-phi')
        const stepnr2 = document.getElementById('deduction-select-stepnr-2')

        if (stepnr1.value !== '' && phi.value !== '') {
          return this.validateFormula(phi, this.exerciseAlert)
        }

        if (phi.value !== '' && stepnr2.value !== '') {
          return this.validateFormula(phi, this.exerciseAlert)
        }

        if (stepnr1.value !== '' && stepnr2.value !== '') {
          return true
        }

        break
      }
      case 'logic.propositional.axiomatic.goal': {
        const phi = document.getElementById('goal-formula-phi')
        const psi = document.getElementById('goal-formula-psi')

        if (this.validateFormula(phi, this.exerciseAlert)) {
          return this.validateFormula(psi, this.exerciseAlert)
        } else {
          return false
        }
      }
    }
  }

  /**
    Validates a step
      Runs callback after correct step has been validated
     */
  validateStep () {
    if (this.ruleKey === null) {
      this.setErrorLocation('rule')
      this.updateAlert('shared.error.noRule', null, 'error')
      return false
    }

    if (!this.validateFormulas()) {
      return false
    }

    const newStep = this.getNewStep()

    this.disableUI(true)
    this.clearErrors()
    this.exerciseValidator.validateApply(this.exercise, newStep, this.onStepValidated.bind(this), this.onErrorValidatingStep.bind(this))
  }

  /**
        Handles the error that the step can not be validated
     */
  onErrorValidatingStep (error) {
    this.disableUI(false)
    if (error === undefined) {
      this.setErrorLocation('validate-step')
      this.updateAlert('shared.error.validatingStep', null, 'error')
      return
    }
    let message = error.key
    if (!hasTranslation(message)) {
      message = 'shared.error.wrongStep'
    }
    this.setErrorLocation('validate-step')
    this.updateAlert(message, error.params, 'error')
  }

  /**
        Handles the event that a step is validated

     */
  onStepValidated () {
    this.updateSteps()

    //    Reset rule value after valid step
    document.getElementById('undo-step').disabled = false
    document.getElementById('redo-step').disabled = true
    document.getElementById('rule').selectedIndex = 0
    document.getElementById('rule').dispatchEvent(new Event('change', { bubbles: true }))
    return true
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
  onHelpForNextStepFound (nextStep) {
    const buttonCallback = function () {
      this.showNextHint(nextStep)
    }.bind(this)
    if (nextStep.stepEnvironment.subgoals !== '') {
      const subgoal = nextStep.stepEnvironment.subgoals.split(';')[0]
      this.updateAlert('logax.hint.proveSubgoal', { subgoal: LogAxStep.convertToLatex(subgoal) }, 'hint', 'shared.hint.nextHint', buttonCallback)
      return
    }

    if (nextStep.formula.length === this.exercise.steps.steps.length) {
      this.updateAlert('logax.hint.motivate', { subgoal: LogAxStep.convertToLatex(nextStep.stepEnvironment.subgoals) }, 'hint', 'shared.hint.nextHint', buttonCallback)
      return
    }

    for (let i = 0; i < nextStep.formula.length; i++) {
      if (nextStep.formula[i].number !== this.exercise.steps.steps[i].number) {
        if (nextStep.formula[i].number < 500) {
          this.updateAlert('logax.hint.performForward', { subgoal: LogAxStep.convertToLatex(nextStep.stepEnvironment.subgoals) }, 'hint', 'shared.hint.nextHint', buttonCallback)
          return
        } else {
          this.updateAlert('logax.hint.performBackward', { subgoal: LogAxStep.convertToLatex(nextStep.stepEnvironment.subgoals) }, 'hint', 'shared.hint.nextHint', buttonCallback)
          return
        }
      }
    }
  }

  showNextHint (nextStep) {
    const buttonCallback = function () {
      this.doNextStep(nextStep)
    }.bind(this)
    this.updateAlert(`logax.hint.applyRule.${nextStep.rule}`, null, 'hint', 'shared.hint.autoStep', buttonCallback)
  }

  showNextStep () {
    if (!this.exercise.isReady) {
      this.exerciseSolver.getHelpForNextStep(this.exercise, this.doNextStep.bind(this), this.onErrorGettingHelpForNextStep.bind(this))
    }
  }

  /**
        Shows the next step
     */
  doNextStep (nextStep) {
    this.exercise.steps.steps = []
    this.exercise.steps.newSet(nextStep.formula)

    this.onStepValidated()
    // Check if ready
    for (const step of this.exercise.steps.steps) {
      if (step.label === undefined) {
        return
      }
    }
    this.exerciseValidator.isFinished(this.exercise, this.onCompleted.bind(this), this.onErrorValidatingStep.bind(this))
  }

  onCompleted (isFinished) {
    if (isFinished) {
      document.getElementById('rule-container').style.display = 'none'
      document.getElementById('completed-rule-container').style.display = ''

      this.removeDeleteButtons()
    }
  }

  removeDeleteButtons () {
    const elements = document.getElementsByClassName('remove-step')
    for (const element of elements) {
      element.style.display = 'none'
    }
    document.getElementById('header-actions').style.display = 'none'
  }

  renumberSteps () {
    const renumberStep = {
      rule: 'logic.propositional.axiomatic.renumber',
      environment: {}
    }
    const callback = function () {
      this.onStepValidated()
      this.removeDeleteButtons()
    }.bind(this)
    this.exerciseValidator.validateApply(this.exercise, renumberStep, callback, this.onErrorValidatingStep.bind(this))
  }

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

    document.getElementById('exercise-step-table').appendChild(exerciseStep)
    this.updateStepnrSelectors()
  }

  updateStepnrSelectors () {
    const stepnrSelectors = document.querySelectorAll('.stepnr-select')
    for (const stepnrSelector of stepnrSelectors) {
      stepnrSelector.innerHTML = ''

      const emptyOption = document.createElement('option')
      translateElement(emptyOption, 'shared.button.selectStep')
      emptyOption.setAttribute('value', '')
      stepnrSelector.appendChild(emptyOption)

      for (const step of this.exercise.steps.steps) {
        const option = document.createElement('option')
        option.innerHTML = step.number
        stepnrSelector.appendChild(option)
      }
    }
  }

  renderStep (step, canDelete) {
    let rule = ''
    let references = ''
    const stepTemplate = $.templates('#exercise-step-template')

    if (step.ruleKey !== undefined) {
      rule = translate(step.ruleKey)
    }
    if (step.references !== undefined) {
      references = step.references.join(', ')
    }

    const exerciseStepHtml = stepTemplate.render({
      rule: rule,
      ruleKey: step.ruleKey,
      references: references,
      term: step.termKatex,
      canDelete: canDelete,
      step: step.number,
      highlightStep: step.highlightStep,
      highlightTerm: step.highlightTerm,
      highlightRule: step.highlightRule
    })

    return exerciseStepHtml
  }

  removeStep (index) {
    const exerciseStepTable = document.getElementById('exercise-step-table')

    for (let i = exerciseStepTable.children.length - 1; i >= 0; i--) {
      if (Number(exerciseStepTable.children[i].getAttribute('number')) === index) {
        exerciseStepTable.removeChild(exerciseStepTable.children[i])
      }
    }
    this.exercise.steps.steps = this.exercise.steps.steps.filter(x => x.number !== index)
  }

  updateSteps () {
    this.clearErrors() // verwijder alle voorgaande foutmeldingen van het scherm

    const exerciseStepTable = document.getElementById('exercise-step-table')
    exerciseStepTable.innerHTML = ''

    for (const step of this.exercise.steps.steps) {
      this.insertStep(step, step.number !== 1000)
    }
    this.disableUI(false)
  }

  undoStep () {
    this.exercise.steps.setHistoryIndex(this.exercise.steps.stepsHistoryIndex - 1)
    this.updateSteps()
    document.getElementById('undo-step').disabled = this.exercise.steps.stepsHistoryIndex === 0
    document.getElementById('redo-step').disabled = false
  }

  redoStep () {
    this.exercise.steps.setHistoryIndex(this.exercise.steps.stepsHistoryIndex + 1)
    this.updateSteps()
    document.getElementById('redo-step').disabled = this.exercise.steps.stepsHistoryIndex === this.exercise.steps.stepsHistory.length - 1
    document.getElementById('undo-step').disabled = false
  }
}
