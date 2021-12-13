import 'katex'
import jsrender from 'jsrender'
import 'katex/dist/katex.min.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import '@fortawesome/fontawesome-free/js/fontawesome'
import '@fortawesome/fontawesome-free/js/solid'
import '@fortawesome/fontawesome-free/js/regular'
import '@fortawesome/fontawesome-free/js/brands'

import { SolutionController } from './SolutionController.js'
import { LogEXSession } from '../logEXSession.js'
import { LogIndExerciseSolver } from '../model/logind/exerciseSolver.js'
import { LogIndExercise } from '../model/logind/exercise.js'
import { translateChildren, loadLanguage } from '../translate.js'

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
    const controller = new LogIndSolutionController()
    controller.solveExercise()
    controller.updateTexts()
  })
}

ready(setUp)

/**
    LogIndController is responsible for handling all user interaction and manipulation of the user interface.
    @constructor
 */

class LogIndSolutionController extends SolutionController {
  constructor () {
    super()
    this.exerciseSolver = new LogIndExerciseSolver(this.config)
    this.ExerciseType = LogIndExercise
    this.baseMotivations = ['calculate', 'del', 'ih', 'logic', 'max', 'min', 'set', 'subst', 'union', 'given']
  }

  /**
        Solves the exercise
     */
  solveExercise () {
    const term = JSON.parse(this.getFormula())
    const exercise = new this.ExerciseType(term, this.exerciseType, false, false)
    this.exerciseSolver.solve(exercise, this.onExerciseSolved.bind(this), this.onErrorSolvingExercise.bind(this))
  }

  /**
        Handles the event that an exercise is solved
        @param {ProofStepCollection} solution - The solution
     */
  onExerciseSolved (solution) {
    const exerciseStepTable = document.getElementById('exercise-case-table')
    exerciseStepTable.innerHTML = ''

    this.insertCaseHeader('baseCases')
    for (const _case of solution.cases.baseCases) {
      this.insertCase(_case)
    }

    this.insertCaseHeader('hypotheses')
    for (const _case of solution.cases.hypotheses) {
      this.insertCase(_case)
    }

    this.insertCaseHeader('inductiveSteps')
    for (const _case of solution.cases.inductiveSteps) {
      this.insertCase(_case)
    }
  }

  insertCaseHeader (title) {
    const exerciseCaseHeaderDiv = document.createElement('template')
    exerciseCaseHeaderDiv.innerHTML = this.renderCaseHeader(title)

    translateChildren(exerciseCaseHeaderDiv.content)

    const exerciseCaseTable = document.getElementById('exercise-case-table')
    exerciseCaseTable.appendChild(exerciseCaseHeaderDiv.content)
  }

  insertCaseMessage (key) {
    const exerciseCaseMessageDiv = document.createElement('template')
    exerciseCaseMessageDiv.innerHTML = this.renderCaseMessage(key)

    translateChildren(exerciseCaseMessageDiv.content)

    const exerciseCaseTable = document.getElementById('exercise-case-table')
    exerciseCaseTable.appendChild(exerciseCaseMessageDiv.content)
  }

  insertCase (_case) {
    const exerciseCaseDiv = document.createElement('template')
    exerciseCaseDiv.innerHTML = this.renderCase(_case)

    translateChildren(exerciseCaseDiv.content)

    const exerciseCaseTable = document.getElementById('exercise-case-table')
    exerciseCaseTable.appendChild(exerciseCaseDiv.content)
  }

  insertActiveHeader () {
    const exerciseStep = document.createElement('tr')
    exerciseStep.id = 'case-header-row'
    exerciseStep.innerHTML = this.renderActiveHeader()

    translateChildren(exerciseStep)

    const exerciseStepTable = document.getElementById('exercise-step-table')
    exerciseStepTable.appendChild(exerciseStep)
  }

  renderCase (_case, canDelete) {
    const stepTemplate = $.templates('#exercise-step-template')

    const newSteps = []
    for (const step of _case.steps) {
      newSteps.push(this.renderStep(step))
    }

    const exerciseStepHtml = stepTemplate.render({
      titleParams: JSON.stringify({ title: _case.getFormattedIdentifier() }),
      type: _case.type,
      steps: newSteps
    })

    return exerciseStepHtml
  }

  renderCaseHeader (title) {
    const stepTemplate = $.templates('#exercise-case-header-template')

    const exerciseStepHtml = stepTemplate.render({
      title: title
    })

    return exerciseStepHtml
  }

  renderCaseMessage (key) {
    const stepTemplate = $.templates('#exercise-case-message-template')
    const exerciseStepHtml = stepTemplate.render({
      key: key
    })

    return exerciseStepHtml
  }

  renderStep (step) {
    const stepTemplate = $.templates('#exercise-case-step-template')

    let motivation = step.rule
    let motivationParams = {}
    if (step.rule !== null && !this.baseMotivations.includes(step.rule)) {
      motivationParams = { function: motivation }
      motivation = 'definition'
    }

    const exerciseStepHtml = stepTemplate.render({
      formula: step.termKatex,
      relation: step.number > 0 ? step.relation : null,
      motivation: motivation,
      motivationParams: JSON.stringify(motivationParams)
    })

    return exerciseStepHtml
  }
}
