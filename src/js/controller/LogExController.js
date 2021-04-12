import { ExerciseController } from './ExerciseController.js'
import { config } from '../config.js'
import { LogEXSession } from '../logEXSession.js'
import { UserRules } from '../model/rules.js'
import { translate } from '../translate.js'

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
    select.innerHTML = translate('shared.button.selectRule')
    comboRule.appendChild(select)

    for (const rule of UserRules) {
      // Rule will only be displayed if it has not already been displayed
      const option = document.createElement('option')
      option.innerHTML = translate(`rule.${rule}`)
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

  disableUI (disable) {
    const inputs = document.getElementsByTagName('input')
    for (const input of inputs) {
      input.disabled = disable
    }

    document.getElementById('wait-exercise').style.display = disable ? '' : 'none'
  }

  /**
        Sets the example exercises
    */
  setExampleExercises () {
    this.exampleExercises = config.exampleExercises[this.exerciseType]
    const exerciseMenu = document.getElementById('new-exercise-menu')

    // inserts the example exercises
    for (let i = 0; i < this.exampleExercises.length; i++) {
      const nr = this.exampleExercises[i] + 1
      const id = 'exercise' + nr
      exerciseMenu.innerHTML += '<a class="dropdown-item" href="#" id="' + id + '"></a>'
    }

    // inserts the randomly generated exercises
    if (config.randomExercises) {
      exerciseMenu.innerHTML += '<div class="dropdown-divider"></div>'
      exerciseMenu.innerHTML += '<a class="dropdown-item" href="#" id="' + 'generate-exercise-easy' + '"></a>'
      exerciseMenu.innerHTML += '<a class="dropdown-item" href="#" id="' + 'generate-exercise-normal' + '"></a>'
      exerciseMenu.innerHTML += '<a class="dropdown-item" href="#" id="' + 'generate-exercise-difficult' + '"></a>'
    }

    // inserts own input exercises
    if (config.inputOwnExercise) {
      exerciseMenu.innerHTML += '<div class="dropdown-divider"></div>'
      exerciseMenu.innerHTML += '<a class="dropdown-item" href="#" id="' + 'new-exercise' + '"></a>'
    }

    // installs event handlers
    document.getElementById('generate-exercise-easy').addEventListener('click', function () {
      this.generateExercise('easy')
    }.bind(this))

    document.getElementById('generate-exercise-normal').addEventListener('click', function () {
      this.generateExercise('medium')
    }.bind(this))

    document.getElementById('generate-exercise-difficult').addEventListener('click', function () {
      this.generateExercise('difficult')
    }.bind(this))

    document.getElementById('new-exercise').addEventListener('click', function () {
      this.newExercise()
    }.bind(this))
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
}
