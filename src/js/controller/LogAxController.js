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

import { FormulaPopover } from '../../shared/kbinput/kbinput.js'

// import { IdeasServiceProxy } from '../model/ideasServiceProxy.js'
import { LogEXSession } from '../logEXSession.js'
import { LogAxExerciseGenerator } from '../model/logax/exerciseGenerator.js'
import { LogAxExerciseSolver } from '../model/logax/exerciseSolver.js'
import { LogAxExerciseValidator } from '../model/logax/exerciseValidator.js'
import { LogAxStep } from '../model/logax/step.js'
// import { LogAxExercise } from '../model/logax/exercise.js'
import { ExerciseController } from './ExerciseController.js'
// import config from '../../../config.json'
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

    this.initializeRules(document.getElementById('rule'))
    this.initializeInput()
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
    const deductionFOptions = {
      id: 9,
      allowUndo: true,
      characters: this.characterOptions
    }
    const deductionBOptions = {
      id: 10,
      allowUndo: true,
      characters: this.characterOptions
    }
    const newFormulaOptions = {
      id: 0,
      characters: this.characterOptions
    }
    this.assumptionPopover = new FormulaPopover(document.getElementById('assumption-formula-phi'), document.getElementById('assumption-phi-input'), assumptionOptions)
    this.axiomAPopover1 = new FormulaPopover(document.getElementById('axiom-a-formula-phi'), document.getElementById('axiom-a-phi-input'), axiomAOptions1)
    this.axiomAPopover2 = new FormulaPopover(document.getElementById('axiom-a-formula-psi'), document.getElementById('axiom-a-psi-input'), axiomAOptions2)
    this.axiomBPopover1 = new FormulaPopover(document.getElementById('axiom-b-formula-phi'), document.getElementById('axiom-b-phi-input'), axiomBOptions1)
    this.axiomBPopover2 = new FormulaPopover(document.getElementById('axiom-b-formula-psi'), document.getElementById('axiom-b-psi-input'), axiomBOptions2)
    this.axiomBPopover3 = new FormulaPopover(document.getElementById('axiom-b-formula-chi'), document.getElementById('axiom-b-chi-input'), axiomBOptions3)
    this.axiomCPopover1 = new FormulaPopover(document.getElementById('axiom-c-formula-phi'), document.getElementById('axiom-c-phi-input'), axiomCOptions1)
    this.axiomCPopover2 = new FormulaPopover(document.getElementById('axiom-c-formula-psi'), document.getElementById('axiom-c-psi-input'), axiomCOptions2)
    this.deductionFPopover = new FormulaPopover(document.getElementById('deduction-forward-formula-phi'), document.getElementById('deduction-forward-phi-input'), deductionFOptions)
    this.deductionBPopover = new FormulaPopover(document.getElementById('deduction-backward-formula-phi'), document.getElementById('deduction-backward-phi-input'), deductionBOptions)

    this.newFormulaPopover = new FormulaPopover(document.getElementById('new-formula'), document.getElementById('new-input'), newFormulaOptions)
  }

  initializeRules (ruleElement) {
    super.initializeRules(ruleElement, this.config.rules.map(rule => rule.split('.')[3])
      .filter((value, index, self) => self.indexOf(value) === index)
      .map(baseRule => `logic.propositional.axiomatic.${baseRule}`))
    const subSelect = document.getElementById('subtype-select')
    const dirSelect = document.getElementById('direction-select')

    ruleElement.addEventListener('change', function () {
      this.updateRuleVisibility(ruleElement, subSelect, dirSelect)
    }.bind(this))

    subSelect.addEventListener('change', function () {
      this.updateRuleVisibility(ruleElement, subSelect, dirSelect)
    }.bind(this))

    dirSelect.addEventListener('change', function () {
      this.updateRuleVisibility(ruleElement, subSelect, dirSelect)
    }.bind(this))
  }

  updateRuleVisibility (ruleElement, subSelect, dirSelect) {
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
      document.getElementById('direction-select-row').style.display = ''
      document.getElementById('subtype-select-row').style.display = 'none'
      switch (dirSelect.selectedIndex) {
        case 0:
          rule = baseRule + '.forward'
          break
        case 1:
          rule = baseRule + '.backward'
          break
        case 2:
          rule = baseRule + '.close'
          break
      }
    } else {
      document.getElementById('direction-select-row').style.display = 'none'
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
    document.getElementById('new-exercise-container').style.display = 'none'
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
      case 'logic.propositional.axiomatic.deduction.forward': {
        const stepnr1 = document.getElementById('deduction-forward-select-stepnr-1')
        const phi = document.getElementById('deduction-forward-formula-phi')

        return {
          environment: {
            n: stepnr1.value,
            phi: LogAxStep.convertToText(phi.value)
          },
          rule: rule
        }
      }
      case 'logic.propositional.axiomatic.deduction.backward': {
        const stepnr2 = document.getElementById('deduction-backward-select-stepnr-2')
        const phi = document.getElementById('deduction-backward-formula-phi')

        return {
          environment: {
            n: stepnr2.value,
            phi: LogAxStep.convertToText(phi.value)
          },
          rule: rule
        }
      }
      case 'logic.propositional.axiomatic.deduction.close': {
        const stepnr1 = document.getElementById('deduction-close-select-stepnr-1')
        const stepnr2 = document.getElementById('deduction-close-select-stepnr-2')

        return {
          environment: {
            n1: stepnr1.value,
            n2: stepnr2.value
          },
          rule: rule
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

    const newStep = this.getNewStep()

    this.disableUI(true)
    this.clearErrors()
    this.exerciseValidator.validateApply(this.exercise, newStep, this.onStepValidated.bind(this), this.onErrorValidatingStep.bind(this))
  }

  /**
        Handles the error that the step can not be validated
     */
  onErrorValidatingStep () {
    this.disableUI(false)
    this.setErrorLocation('validate-step')
    this.updateAlert('shared.error.validatingStep', null, 'error')
  }

  /**
        Handles the event that a step is validated

     */
  onStepValidated () {
    this.clearErrors() // verwijder alle voorgaande foutmeldingen van het scherm

    const exerciseStepTable = document.getElementById('exercise-step-table')
    exerciseStepTable.innerHTML = ''

    for (const step of this.exercise.steps.steps) {
      this.insertStep(step, step.number !== 1000)
    }
    this.disableUI(false)

    //    Reset rule value after valid step
    document.getElementById('rule').selectedIndex = 0
    document.getElementById('rule').dispatchEvent(new Event('change', { bubbles: true }))
    return true
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
      for (const step of this.exercise.steps.steps) {
        const option = document.createElement('option')
        option.innerHTML = step.number
        stepnrSelector.appendChild(option)
      }
    }
  }

  renderStep (step, canDelete) {
    let rule = ''
    const stepTemplate = $.templates('#exercise-step-template')

    if (step.ruleKey !== undefined) {
      rule = translate(step.ruleKey)
    }

    const exerciseStepHtml = stepTemplate.render({
      rule: rule,
      ruleKey: step.ruleKey,
      term: step.termKatex,
      canDelete: canDelete,
      step: step.number
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
}
