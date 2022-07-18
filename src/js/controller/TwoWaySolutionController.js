import katex from 'katex'
import jsrender from 'jsrender'
import 'katex/dist/katex.min.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import '@fortawesome/fontawesome-free/js/fontawesome'
import '@fortawesome/fontawesome-free/js/solid'
import '@fortawesome/fontawesome-free/js/regular'
import '@fortawesome/fontawesome-free/js/brands'

import { LogExSolutionController } from './LogExSolutionController.js'
import { LogEXSession } from '../logEXSession.js'
import { Rules } from '../model/rules.js'
import { TwoWayExerciseSolver } from '../model/twoway/exerciseSolver.js'
import { TwoWayExercise } from '../model/twoway/exercise.js'
import { translate, loadLanguage } from '../translate.js'

const $ = jsrender(null)

function ready (fn) {
  if (document.readyState !== 'loading') {
    fn()
  } else {
    document.addEventListener('DOMContentLoaded', fn)
  }
}

function setUp () {
  const language = LogEXSession.getLanguage()
  loadLanguage(language, function () {
    const controller = new TwoWaySolutionController()
    controller.solveExercise()
    controller.updateTexts()
  })
}

ready(setUp)

/**
    TwoWayController is responsible for handling all user interaction and manipulation of the user interface.
    @constructor
 */

class TwoWaySolutionController extends LogExSolutionController {
  constructor () {
    super()
    this.exerciseSolver = new TwoWayExerciseSolver(this.config)
    this.ExerciseType = TwoWayExercise
  }

  /**
        Solves the exercise
     */
  solveExercise () {
    const term = JSON.parse(this.getFormula())
    this.exercise = new this.ExerciseType(term, this.exerciseType, false, false)
    this.exerciseSolver.solve(this.exercise, this.onExerciseSolved.bind(this), this.onErrorSolvingExercise.bind(this))
  }

  /**
        Handles the event that an exercise is solved
        @param {TwoWayStepCollection} solution - The solution
     */
  onExerciseSolved (solution) {
    this.exercise.steps.setSteps(this.exercise, solution)
    for (const step of this.exercise.steps.topSteps) {
      this.insertStep(step, step.number !== 0)
    }
    for (const step of this.exercise.steps.bottomSteps.reverse()) {
      this.insertStep(step, step.number !== this.exercise.steps.steps.length - 1)
    }
  }

  renderStep (step) {
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
      canDelete: false,
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
}
