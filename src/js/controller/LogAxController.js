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
    const formulaOptions = {
      id: 1,
      allowUndo: true,
      characters: this.characterOptions
    }
    const newFormulaOptions = {
      id: 2,
      characters: this.characterOptions
    }
    this.formulaPopover = new FormulaPopover(document.getElementById('assumption-formula'), document.getElementById('one-way-input'), formulaOptions)
    this.newFormulaPopover = new FormulaPopover(document.getElementById('new-formula'), document.getElementById('new-input'), newFormulaOptions)
  }

  initializeRules (ruleElement) {
    super.initializeRules(ruleElement, this.config.rules.filter(x => !x.endsWith('.close')))
    const subSelect = document.getElementById('subtype-select')

    ruleElement.addEventListener('change', function () {
      this.updateRuleVisibility(ruleElement, subSelect)
    }.bind(this))

    subSelect.addEventListener('change', function () {
      this.updateRuleVisibility(ruleElement, subSelect)
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

    if (this.config.rules.includes(`${baseRule}.close`)) {
      document.getElementById('subtype-select-row').style.display = ''
    } else {
      document.getElementById('subtype-select-row').style.display = 'none'
    }

    const rule = baseRule + (subSelect.selectedIndex === 1 ? '.close' : '')

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
    const rule = this.getSelectedRuleKey()

    switch (rule) {
      case 'logic.propositional.axiomatic.assumption': {
        const newFormula = document.getElementById('assumption-formula')
        if (newFormula.value === this.exercise.getCurrentStep().formula) {
          this.setErrorLocation('assumption-formula')
          this.updateAlert('shared.error.notChanged', null, 'error')
          return false
        }
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
            n: LogAxStep.convertToText(stepnr.value)
          },
          rule: rule
        }
      }
    }
  }

  getSelectedRuleKey () {
    const baseRule = document.getElementById('rule').selectedOptions[0].getAttribute('translate-key').substring(5) // Remove 'rule.'

    return baseRule + (document.getElementById('subtype-select').selectedIndex === 1 ? '.close' : '')
  }

  /**
    Validates a step
      Runs callback after correct step has been validated
     */
  validateStep () {
    const ruleKey = this.getSelectedRuleKey()
    if (ruleKey === null) {
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
