import { IdeasServiceProxy } from '../model/ideasServiceProxy.js'
import { ExerciseController } from './ExerciseController.js'
import config from '../../../config.json'
import { UserRules } from '../model/rules.js'

export class LogExController extends ExerciseController {
  constructor () {
    super()
    this.characterOptions = [
      {
        char: '¬',
        latex: '\\neg',
        triggers: ['-', 'n', '1', '`', '!', 'N']
      },
      {
        char: '∧',
        latex: '\\land',
        triggers: ['a', '7', '&', 'A'],
        spaces: true
      },
      {
        char: '∨',
        latex: '\\lor',
        triggers: ['o', 'v', '|', '\\', 'O', 'V'],
        spaces: true
      },
      {
        char: '→',
        latex: '\\rightarrow',
        triggers: ['i', '.', 'I'],
        spaces: true
      },
      {
        char: '↔',
        latex: '\\leftrightarrow',
        triggers: ['=', 'e', 'E'],
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
        char: 'T',
        latex: 'T',
        triggers: ['t']
      },
      {
        char: 'F',
        latex: 'F',
        triggers: ['f']
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
      }
    ]

    document.getElementById('validate-step').addEventListener('click', function () {
      this.validateStep()
    }.bind(this))

    if (document.getElementById('rule-switch')) {
      document.getElementById('rule-switch').addEventListener('click', function () {
        this.changeRuleJustification()
      }.bind(this))
    }

    document.getElementById('step-validation-switch').addEventListener('click', function () {
      this.changeStepValidation()
    }.bind(this))
  }

  /**
        Initializes drop down box for rules from Rules dictionary
     */
  initializeRules (comboRule) {
    // Clear ruleset if already set
    comboRule.innerHTML = ''
    const select = document.createElement('option')
    select.setAttribute('translate-key', 'shared.button.selectRule')
    comboRule.appendChild(select)

    for (const rule of UserRules) {
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
    return UserRules[index - 1]
  }

  /**
      Initializes rule justification
   */
  initializeRuleJustification () {
    document.getElementById('rule-switch').checked = config.useRuleJustification
    if (config.displayRuleJustification) {
      document.getElementById('rule-switch-div').style.display = ''
    }
  }

  changeRuleJustification () {
    const usesRuleJustification = document.getElementById('rule-switch').checked
    if (this.exercise) {
      this.exercise.usesRuleJustification = usesRuleJustification
    }
    if (usesRuleJustification) {
      document.getElementById('rule').style.display = ''
    } else {
      document.getElementById('rule').style.display = 'none'
    }
  }

  /**
        Initializes step validation
     */
  initializeStepValidation () {
    document.getElementById('step-validation-switch').checked = config.useStepValidation
    if (config.displayStepValidation) {
      document.getElementById('step-validation-switch-div').style.display = ''
    }
  }

  changeStepValidation () {
    const usesStepValidation = document.getElementById('step-validation-switch').checked
    if (this.exercise) {
      this.exercise.usesStepValidation = usesStepValidation
    }
  }

  insertStep(step, canDelete) {
    super.insertStep(step, canDelete)

    this.formulaPopover.previousValue = step.formula
  }

  /**
        Validates the formula

        @param formula - The DOM element that contains the formula
        @param onFormulasValidated - The callback function
     */
  validateFormula (formulaElement, alert) {
    const result = this.syntaxValidator.validateSyntax(formulaElement.value)
    if (result !== null) {
      this.setErrorLocation(formulaElement.id)
      alert.updateAlert(result.key, result.params, 'error')
      this.isFormulaValid = false
      IdeasServiceProxy.log({ exerciseid: this.exercise.type, formula: formulaElement.value, syntaxError: result.key })
      return false
    }
    this.isFormulaValid = true
    return true
  }
}
