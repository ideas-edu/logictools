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

    this.exerciseGenerator = new LogAxExerciseGenerator()
    this.exerciseSolver = new LogAxExerciseSolver()
    // validation
    this.exerciseValidator = new LogAxExerciseValidator()

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
    super.initializeRules(ruleElement)

    ruleElement.addEventListener('change', function () {
      const elements = document.querySelectorAll('[rule]')
      for (const element of elements) {
        element.style.display = 'none'
      }

      const rule = ruleElement.selectedOptions[0].getAttribute('translate-key')

      const selectedElements = document.querySelectorAll(`[rule='${rule}']`)
      for (const element of selectedElements) {
        element.style.display = ''
      }

      if (rule === 'rule.logic.propositional.axiomatic.assumption') {
        this.updateAssumptionSelect()
      }
    }.bind(this))

    document.getElementById('assumption-select').addEventListener('change', function () {
      this.updateAssumptionSelect()
    }.bind(this))
  }

  updateAssumptionSelect () {
    switch (document.getElementById('assumption-select').selectedIndex) {
      case 0:
        document.getElementById('assumption-phi').style.display = ''
        document.getElementById('assumption-stepnr').style.display = 'none'
        break
      case 1:
        document.getElementById('assumption-phi').style.display = 'none'
        document.getElementById('assumption-stepnr').style.display = ''
        break
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
      if (stepRow.classList.contains('exercise-step')) {
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
    const rule = document.getElementById('rule').selectedOptions[0].getAttribute('translate-key')
    const ruleKey = `rule.${this.getSelectedRuleKey()}`

    switch (rule) {
      case 'rule.logic.propositional.axiomatic.assumption': {
        const newFormula = document.getElementById('assumption-formula')
        if (newFormula.value === this.exercise.getCurrentStep().formula) {
          this.setErrorLocation('assumption-formula')
          this.updateAlert('shared.error.notChanged', null, 'error')
          return false
        }
        return new LogAxStep(`1.${newFormula.value}|-${newFormula.value}`, ruleKey)
      }
    }
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
    this.exercise.steps.push(newStep)
    if (this.exercise.usesStepValidation) {
      this.exerciseValidator.validateStep(this.exercise, this.exercise.getPreviousStep(), this.exercise.getCurrentStep(), this.onStepValidated.bind(this), this.onErrorValidatingStep.bind(this))
    } else {
      this.onStepValidated()
    }
  }

  /**
        Handles the event that a step is validated

     */
  onStepValidated () {
    const currentStep = this.exercise.getCurrentStep()
    let message
    let errorLocation

    this.clearErrors() // verwijder alle voorgaande foutmeldingen van het scherm

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
      this.disableUI(false)

      //    Reset rule value after valid step
      document.getElementById('rule').selectedIndex = 0
      document.getElementById('rule').dispatchEvent(new Event('change', { bubbles: true }))
      return true
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
}
