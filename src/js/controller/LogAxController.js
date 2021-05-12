// import jsrender from 'jsrender'
import 'bootstrap'
import 'iframe-resizer'
import 'bootstrap/dist/css/bootstrap.min.css'
import '@fortawesome/fontawesome-free/js/fontawesome'
import '@fortawesome/fontawesome-free/js/solid'
import '@fortawesome/fontawesome-free/js/regular'
import '@fortawesome/fontawesome-free/js/brands'
import 'katex/dist/katex.min.css'
// import katex from 'katex'

// import { IdeasServiceProxy } from '../model/ideasServiceProxy.js'
import { LogEXSession } from '../logEXSession.js'
import { LogAxExerciseGenerator } from '../model/logax/exerciseGenerator.js'
import { LogAxExerciseSolver } from '../model/logax/exerciseSolver.js'
import { LogAxExerciseValidator } from '../model/logax/exerciseValidator.js'
// import { LogAxStep } from '../model/logax/step.js'
// import { LogAxExercise } from '../model/logax/exercise.js'
import { ExerciseController } from './ExerciseController.js'
// import config from '../../../config.json'
import { translateElement, loadLanguage } from '../translate.js'

// const $ = jsrender(null)

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
  }
}
