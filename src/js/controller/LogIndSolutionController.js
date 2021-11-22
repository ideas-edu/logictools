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
        Handles the event that an exercise is solved
        @param {ProofStepCollection} solution - The solution
     */
  onExerciseSolved (solution) {
    this.exercise = solution
    const exerciseStepTable = document.getElementById('exercise-case-table')
    exerciseStepTable.innerHTML = ''

    this.insertCaseHeader('baseCases')
    console.log(this.exercise)
    for (const _case of this.exercise.cases.baseCases) {
      this.insertCase(_case)
    }

    this.insertCaseHeader('hypotheses')
    for (const _case of this.exercise.cases.hypotheses) {
      this.insertCase(_case)
    }

    this.insertCaseHeader('inductiveSteps')
    for (const _case of this.exercise.cases.inductiveSteps) {
      this.insertCase(_case)
    }
  }

  /**
        Solves the exercise
     */
  solveExercise () {
    const term = JSON.parse(this.getFormula())
    const exercise = new this.ExerciseType(term, this.exerciseType, false, false)
    this.exerciseSolver.solve(exercise, this.onExerciseSolved.bind(this), this.onErrorSolvingExercise.bind(this))
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

  insertStep (step, isActive) {
    this.dismissAlert()

    const exerciseStep = document.createElement('template')
    exerciseStep.innerHTML = this.renderStep(step, true)

    translateChildren(exerciseStep.content)

    const exerciseStepTable = document.getElementById('exercise-step-table')
    exerciseStepTable.appendChild(exerciseStep.content)
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

    let wasTopStep = true
    for (const step of _case.steps) {
      if (!step.isTopStep && wasTopStep) {
        newSteps.push(this.renderCaseBuffer(_case))
      }
      wasTopStep = step.isTopStep
      newSteps.push(this.renderStep(step, false))
    }
    let border = null
    let status = null
    if (this.exercise.activeCase !== null && _case.identifier === this.exercise.activeCase.identifier) {
      border = 'active'
      status = 'active'
    } else {
      status = _case.status
    }

    const exerciseStepHtml = stepTemplate.render({
      titleParams: JSON.stringify({ title: _case.getFormattedIdentifier() }),
      border: border,
      type: _case.type,
      status: status,
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

  renderStep (step, isActive) {
    const stepTemplate = $.templates(isActive ? (step.isTopStep ? '#exercise-active-top-step-template' : '#exercise-active-bottom-step-template') : '#exercise-case-step-template')
    let border = null

    if (this.exercise.activeCase !== null && step.case.identifier === this.exercise.activeCase.identifier) {
      border = 'active'
    }

    let motivation = step.rule
    let motivationParams = {}
    if (step.rule !== null && !this.baseMotivations.includes(step.rule)) {
      motivationParams = { function: motivation }
      motivation = 'definition'
    }

    const exerciseStepHtml = stepTemplate.render({
      border: border,
      isEmptyFormula: step.term === '',
      isFirst: step.number === 0,
      isTopStep: step.isTopStep,
      isLast: step.number === step.case.steps.length - 1,
      formula: step.termKatex,
      relation: step.number > 0 ? step.relation : null,
      motivation: motivation,
      motivationParams: JSON.stringify(motivationParams)
    })

    return exerciseStepHtml
  }

  updateAlert (innerHTML, type) {
    document.getElementById('exercise-alert-container').style.display = ''
    switch (type) {
      case 'hint':
        document.getElementById('exercise-alert-icon').innerHTML = '<i class="fas fa-lg fa-info-circle"></i>'
        document.getElementById('exercise-alert').classList = 'alert col-md-12 hint-alert'
        break
      case 'error':
        document.getElementById('exercise-alert-icon').innerHTML = '<i class="fas fa-lg fa-exclamation-circle"></i>'
        document.getElementById('exercise-alert').classList = 'alert col-md-12 error-alert'
        break
      case 'complete':
        document.getElementById('exercise-alert-icon').innerHTML = '<i class="fas fa-lg fa-check-circle"></i>'
        document.getElementById('exercise-alert').classList = 'alert col-md-12 complete-alert'
        break
    }
    document.getElementById('exercise-alert-span').innerHTML = innerHTML
  }
}
