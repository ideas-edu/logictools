import { ExerciseController } from './ExerciseController.js'
import { config } from '../config.js'
import { LogEXSession } from '../logEXSession.js'

export class LogExController extends ExerciseController {
  constructor () {
    super()
    this.characterOptions = [
      {
        char: '¬',
        triggers: ['-', 'n', '~', '1', '`', '!', 'N']
      },
      {
        char: '∧',
        triggers: ['a', '7', '6', '^', '&', 'A'],
        spaces: true
      },
      {
        char: '∨',
        triggers: ['o', 'v', '|', '\\', 'O', 'V'],
        spaces: true
      },
      {
        char: '→',
        triggers: ['i', '.', 'I'],
        spaces: true
      },
      {
        char: '↔',
        triggers: ['=', 'e', 'E'],
        spaces: true
      },
      {
        char: 'p',
        triggers: ['P'],
        charStyled: '<i>p</i>'
      },
      {
        char: 'q',
        triggers: ['Q'],
        charStyled: '<i>q</i>'
      },
      {
        char: 'r',
        triggers: ['R'],
        charStyled: '<i>r</i>'
      },
      {
        char: 's',
        triggers: ['S'],
        charStyled: '<i>s</i>'
      },
      {
        char: 'T',
        triggers: ['t']
      },
      {
        char: 'F',
        triggers: ['f']
      },
      {
        char: '(',
        triggers: ['9']
      },
      {
        char: ')',
        triggers: ['0']
      }
    ]

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
      LogEXSession.setDifficulty('easy')
      this.generateExercise()
    }.bind(this))
    document.getElementById('generate-exercise-normal').addEventListener('click', function () {
      LogEXSession.setDifficulty('medium')
      this.generateExercise()
    }.bind(this))

    document.getElementById('generate-exercise-difficult').addEventListener('click', function () {
      LogEXSession.setDifficulty('difficult')
      this.generateExercise()
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
