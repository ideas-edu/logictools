import jsrender from 'jsrender'
import 'bootstrap'
import 'iframe-resizer'
import 'bootstrap/dist/css/bootstrap.min.css'
import '@fortawesome/fontawesome-free/js/fontawesome'
import '@fortawesome/fontawesome-free/js/solid'
import '@fortawesome/fontawesome-free/js/regular'
import '@fortawesome/fontawesome-free/js/brands'
import 'katex/dist/katex.min.css'

import { FormulaPopover } from '../kbinput.js'

import { LogEXSession } from '../logEXSession.js'
import { LogIndExerciseGenerator } from '../model/logind/exerciseGenerator.js'
import { LogIndExerciseSolver } from '../model/logind/exerciseSolver.js'
import { LogIndExerciseValidator } from '../model/logind/exerciseValidator.js'
import { LogIndCase } from '../model/logind/stepCollection.js'
import { SyntaxValidator } from '../model/syntaxValidator.js'
import { ExerciseController } from './ExerciseController.js'
import { translateElement, translateChildren, loadLanguage, hasTranslation } from '../translate.js'

const $ = jsrender(null)

function ready (fn) {
  if (document.readyState !== 'loading') {
    fn()
  } else {
    document.addEventListener('DOMContentLoaded', fn)
  }
}

function setUp () {
  window.controller = new LogIndController()
  window.translate = loadLanguage
  loadLanguage(LogEXSession.getLanguage())
}

ready(setUp)

export class LogIndController extends ExerciseController {
  constructor () {
    super()
    this.ruleKey = null
    this.formulaOptions = {
      unaryOperators: ['¬'],
      binaryOperators: ['→', ''],
      literals: ['p', 'q', 'r', 's']
    }
    this.characterOptions = []
    this.motivationOptions = []
    this.setExampleExercises()

    this.activeStepIndex = null

    this.exerciseGenerator = new LogIndExerciseGenerator(this.config)
    this.exerciseSolver = new LogIndExerciseSolver(this.config)
    // validation
    this.exerciseValidator = new LogIndExerciseValidator(this.config)
    this.syntaxValidator = new SyntaxValidator()

    this.initializeInput()

    document.getElementById('renumber-step').addEventListener('click', function () {
      this.renumberSteps()
    }.bind(this))

    document.getElementById('move-step-up').addEventListener('mousedown', function () {
      this.moveStepUp()
    }.bind(this))

    document.getElementById('move-step-down').addEventListener('mousedown', function () {
      this.moveStepDown()
    }.bind(this))

    document.getElementById('insert-step-above').addEventListener('mousedown', function () {
      this.insertStepAbove()
    }.bind(this))

    document.getElementById('insert-step-below').addEventListener('mousedown', function () {
      this.insertStepBelow()
    }.bind(this))

    document.getElementById('delete-step').addEventListener('click', function () {
      this.deleteStep()
    }.bind(this))

    document.getElementById('check-step').addEventListener('click', function () {
      this.checkStep()
    }.bind(this))

    document.getElementById('complete-exercise').addEventListener('click', function () {
      this.completeSolution()
    }.bind(this))
  }

  /**
        Creates the popover for the input of symbols
    */
  initializeInput () {
    const formulaOptions = {
      id: 1,
      characters: this.characterOptions
    }
    this.assumptionPopover = new FormulaPopover(document.getElementById('formula'), document.getElementById('formula-input'), formulaOptions, this.kbCallback.bind(this))

    this.setMotivation()

    // // apply
    const applyButton = document.getElementById('validate-step')
    applyButton.disabled = false
  }

  setMotivation () {
    document.getElementById('motivation').innerHTML = ''
    for (const motivation of this.motivationOptions) {
      const option = document.createElement('option')
      option.value = motivation
      option.innerHTML = motivation
      document.getElementById('motivation').appendChild(option)
    }
  }

  /**
        Handles the error that an exercise can not be created
     */
  onErrorCreatingExercise () {
    this.exercise = null
    this.disableUI(false)
    this.setErrorLocation('new-formula-1')
    this.newExerciseAlert.updateAlert('shared.error.creatingExercise', null, 'error')
  }

  /**
    */
  showExercise () {
    this.activeStepIndex = null
    document.getElementById('rule').selectedIndex = 0
    this.initializeRules(document.getElementById('rule'))
    document.getElementById('exercise-container').style.display = ''
    document.getElementById('rule-container').style.display = ''
    document.getElementById('completed-rule-container').style.display = 'none'

    document.getElementById('exercise-step-table').style.display = 'none'
    document.getElementById('instruction').innerHTML = this.exercise.problem
    document.getElementById('rule').addEventListener('change', function () {
      document.getElementById('exercise-step-table').style.display = document.getElementById('rule').selectedIndex === 0 ? 'none' : ''
    })
    translateElement(document.getElementById('instruction'), 'logind.instruction.exercise', {
      problem: this.exercise.problem,
      title: {
        key: this.exercise.titleKey,
        params: this.exercise.titleParams
      }
    })
    this.clearErrors()

    this.characterOptions = [{
      char: 'φ',
      latex: '\\phi',
      triggers: []
    },
    {
      char: 'ψ',
      latex: '\\psi',
      triggers: []
    },
    {
      char: 'χ',
      latex: '\\chi',
      triggers: []
    },
    {
      char: '∪',
      latex: '\\cup',
      triggers: []
    }]
    for (let i = 'a'.charCodeAt(0); i <= 'z'.charCodeAt(0); i++) {
      this.characterOptions.push({
        char: String.fromCharCode(i),
        triggers: [String.fromCharCode(i)],
        hideButton: true
      })
    }
    for (let i = '0'.charCodeAt(0); i <= '9'.charCodeAt(0); i++) {
      this.characterOptions.push({
        char: String.fromCharCode(i),
        triggers: [String.fromCharCode(i)],
        hideButton: true
      })
    }
    for (const char of ['+', '-', '*', '/', '(', ')', ',', '{', '}', '[', ']', '\\']) {
      this.characterOptions.push({
        char: char,
        triggers: [char],
        hideButton: true
      })
    }
    this.motivationOptions = ['?', 'calculate', 'definition del', 'induction hypothesis', 'logic', 'definition max',
      'definition min', 'setrule', 'definition subst', 'definition union', 'given']
    for (const term of this.exercise.language) {
      switch (term) {
        case 'NEGATION':
          this.characterOptions.push({
            char: '¬',
            latex: '\\neg',
            triggers: ['`', '!']
          })
          break
        case 'OR':
          this.characterOptions.push({
            char: '∨',
            latex: '\\lor',
            triggers: ['|']
          })
          break
        case 'AND':
          this.characterOptions.push({
            char: '∧',
            latex: '\\land',
            triggers: ['&', '^']
          })
          break
        case 'IMPLIES':
          this.characterOptions.push({
            char: '→',
            latex: '\\rightarrow',
            triggers: ['>'],
            spaces: 'lr'
          })
          break
      }
    }
    for (const term of this.exercise.definitions) {
      this.characterOptions.push({
        char: term,
        latex: `\\texttt{${term}}`,
        triggers: [],
        function: true
      })
      this.motivationOptions.push(term)
    }
    this.assumptionPopover.options.characters = this.characterOptions
    this.assumptionPopover.setContent()
    this.setMotivation()

    // document.getElementById('header-actions').style.display = ''
    this.updateCases()
    this.updateSteps()
    this.setInput()
  }

  showSolution () {
    const term = {
      proof: [{
        term: this.exercise.theorem,
        number: 1000
      }]
    }
    window.open('logindsolution.html?formula=' + encodeURIComponent(JSON.stringify(term)) + '&exerciseType=' + this.exercise.type + '&controller=' + this.exerciseType, '_blank', 'location=no,width=1020,height=600,status=no,toolbar=no')
  }

  completeSolution () {
    window.open('logindsolution.html?formula=' + encodeURIComponent(JSON.stringify(this.exercise.getObject())) + '&exerciseType=' + this.exercise.type + '&controller=' + this.exerciseType, '_blank', 'location=no,width=1020,height=600,status=no,toolbar=no')
  }

  disableUI (disable) {
    super.disableUI(disable)
    this.applyReady()
  }

  applyReady () {
    const applyButton = document.getElementById('validate-step')
    applyButton.disabled = false
  }

  validateFormulas () {
    const rule = this.ruleKey

    switch (rule) {
      case 'logic.propositional.axiomatic.assumption': {
        const phi = document.getElementById('assumption-formula-phi')
        return this.validateFormula(phi, this.exerciseAlert)
      }
    }
  }

  checkStep () {
    this.setStep()
    this.exerciseValidator.validateExercise(this.exercise, this.onStepValidated.bind(this), this.onErrorValidatingStep.bind(this))
  }

  /**
    Validates a step
      Runs callback after correct step has been validated
     */
  validateStep () {
    if (this.getSelectedRuleKey() === null) {
      this.setErrorLocation('rule')
      this.updateAlert('shared.error.noRule', null, 'error')
      return false
    }

    const onSuccess = function (term, resultType) {
      if (term === undefined) {
        this.onStepValidated(term, resultType)
        this.disableUI(false)
        return
      }
      this.exercise.setCases(term.proofs)
      this.exercise.activeCase = new LogIndCase(this.exercise)
      this.activeStepIndex = null
      const onSuccess = function (result) {
        this.onCheckConstraints(result)
        this.setInput()
        this.updateSteps()
        this.updateCases()
        document.getElementById('rule').selectedIndex = 0
        document.getElementById('exercise-step-table').style.display = 'none'
      }
      this.exerciseValidator.checkConstraints(this.exercise, onSuccess.bind(this), this.onErrorValidatingStep.bind(this))

      this.disableUI(false)
      this.clearErrors()
    }.bind(this)

    this.setStep()
    this.disableUI(true)
    this.exerciseValidator.validateExercise(this.exercise, onSuccess.bind(this), this.onErrorValidatingStep.bind(this))
  }

  onCheckConstraints (result) {
    for (const constraint of result) {
      switch (constraint.constraint) {
        case 'basesteps-finished':
          switch (constraint.value) {
            case 'ok':
              this.exercise.baseCasesStatus = 'complete'
              break
            case 'irrelevant':
              this.exercise.baseCasesStatus = 'notStarted'
              break
            default:
              this.exercise.baseCasesStatus = 'incomplete'
              break
          }
          break
        case 'ihsteps-finished':
          switch (constraint.value) {
            case 'ok':
              this.exercise.hypothesesStatus = 'complete'
              break
            case 'irrelevant':
              this.exercise.hypothesesStatus = 'notStarted'
              break
            default:
              this.exercise.hypothesesStatus = 'incomplete'
              break
          }
          break
        case 'inductivesteps-finished':
          switch (constraint.value) {
            case 'ok':
              this.exercise.inductiveStepsStatus = 'complete'
              break
            case 'irrelevant':
              this.exercise.inductiveStepsStatus = 'notStarted'
              break
            default:
              this.exercise.inductiveStepsStatus = 'incomplete'
              break
          }
          break
      }
    }
  }

  /**
        Handles the error that the step can not be validated
     */
  onErrorValidatingStep (error) {
    this.disableUI(false)
    if (error === undefined) {
      this.setErrorLocation('validate-step')
      this.updateAlert('shared.error.validatingStep', null, 'error')
      return
    }
    let message = error.key
    if (!hasTranslation(message)) {
      message = 'shared.error.wrongStep'
    }
    this.setErrorLocation('validate-step')
    this.updateAlert(message, error.params, 'error')
  }

  /**
        Handles the event that a step is validated

     */
  onStepValidated (term, resultType) {
    switch (resultType) {
      case 'similar':
        this.exercise.setCases(term.proofs, term.active)
        this.updateCases()
        this.updateAlert('logind.error.correct', null, 'complete')
        break
      case 'notequiv':
        this.updateAlert('logind.error.incorrect', null, 'error')
        break
    }
    return true
  }

  /**
        Shows the hint
     */
  showHint () {
    if (!this.exercise.isReady) {
      this.exerciseSolver.getHelpForNextStep(this.exercise, this.onHelpForNextStepFound.bind(this), this.onErrorGettingHelpForNextStep.bind(this))
    }
  }

  /**
        Handles the event that help for a next step is found
        @param {OneWayStep} nextOneWayStep - The next one way step
     */
  onHelpForNextStepFound (nextStep) {
    const buttonCallback = function () {
      this.doNextStep(nextStep)
    }.bind(this)

    if (this.exercise.definitions.includes(nextStep.rule)) {
      this.updateAlert('logind.hint.function', { function: nextStep.rule }, 'hint', 'shared.hint.autoStep', buttonCallback)
    } else if (this.exercise.definitions.includes(nextStep.rule.split('.')[0])) {
      this.updateAlert('logind.hint.function.close', { function: nextStep.rule.split('.')[0] }, 'hint', 'shared.hint.autoStep', buttonCallback)
    } else {
      this.updateAlert(`logind.hint.${nextStep.rule}`, null, 'hint', 'shared.hint.autoStep', buttonCallback)
    }
  }

  showNextStep () {
    if (!this.exercise.isReady) {
      this.exerciseSolver.getHelpForNextStep(this.exercise, this.doNextStep.bind(this), this.onErrorGettingHelpForNextStep.bind(this))
    }
  }

  /**
        Shows the next step
     */
  doNextStep (nextStep) {
    this.exercise.setCases(nextStep.formula.proofs, nextStep.formula.active)
    const onSuccess = function (result) {
      this.onCheckConstraints(result)
      this.setInput()
      this.updateSteps()
      this.updateCases()
    }
    this.exerciseValidator.checkConstraints(this.exercise, onSuccess.bind(this), this.onErrorValidatingStep.bind(this))
  }

  onCompleted (isFinished) {
    if (isFinished) {
      document.getElementById('rule-container').style.display = 'none'
      document.getElementById('completed-rule-container').style.display = ''

      this.removeDeleteButtons()
    }
  }

  removeDeleteButtons () {
    const elements = document.getElementsByClassName('remove-step')
    for (const element of elements) {
      element.style.display = 'none'
    }
    document.getElementById('header-actions').style.display = 'none'
  }

  insertCaseHeader (title, status) {
    const exerciseCaseHeaderDiv = document.createElement('template')
    exerciseCaseHeaderDiv.innerHTML = this.renderCaseHeader(title, status)

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

    exerciseCaseDiv.content.querySelector('.delete-case').addEventListener('click', function () {
      this.deleteCase(_case.index, _case.type)
    }.bind(this))

    exerciseCaseDiv.content.querySelector('.edit-case').addEventListener('click', function () {
      this.editCase(_case.index, _case.type)
    }.bind(this))

    const exerciseCaseTable = document.getElementById('exercise-case-table')
    exerciseCaseTable.appendChild(exerciseCaseDiv.content)
  }

  insertStep (step, isActive) {
    this.dismissAlert()

    const exerciseStep = document.createElement('tr')
    exerciseStep.classList.add('case-step-row')
    exerciseStep.innerHTML = this.renderStep(step, true)

    translateChildren(exerciseStep)

    const exerciseStepTable = document.getElementById('exercise-step-table')
    if (step.number < this.activeStepIndex || this.activeStepIndex === null) {
      exerciseStepTable.insertBefore(exerciseStep, document.getElementById('active-step'))
    } else if (step.number > this.activeStepIndex) {
      exerciseStepTable.appendChild(exerciseStep)
    }

    exerciseStep.addEventListener('mousedown', function () {
      this.moveToStep(step.number)
    }.bind(this))
  }

  renderCase (_case, canDelete) {
    const stepTemplate = $.templates('#exercise-step-template')

    const newSteps = []

    for (const step of _case.steps) {
      newSteps.push(this.renderStep(step, false))
    }
    let border = null

    if (_case.identifier === this.exercise.activeCase.identifier) {
      border = 'active'
    }

    const exerciseStepHtml = stepTemplate.render({
      titleParams: JSON.stringify({ title: _case.getFormattedIdentifier() }),
      border: border,
      type: _case.type,
      steps: newSteps
    })

    return exerciseStepHtml
  }

  renderCaseHeader (title, status) {
    const stepTemplate = $.templates('#exercise-case-header-template')

    const exerciseStepHtml = stepTemplate.render({
      title: title,
      status: status
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
    const stepTemplate = $.templates(isActive ? '#exercise-active-step-template' : '#exercise-case-step-template')
    let border = null

    if (step.case.identifier === this.exercise.activeCase.identifier) {
      border = 'active'
    }

    const exerciseStepHtml = stepTemplate.render({
      border: border,
      isEmptyFormula: step.term === '',
      isFirst: step.number === 0,
      isLast: step.number === step.case.steps.length - 1,
      formula: step.termKatex,
      relation: step.number > 0 ? step.relation : null,
      motivation: step.number > 0 ? step.rule : null
    })

    return exerciseStepHtml
  }

  removeStep (index) {
    let newSteps = null
    if (index < 500) {
      newSteps = this.exercise.steps.steps.filter(x => x.number < index || x.number > 500)
    } else {
      newSteps = this.exercise.steps.steps.filter(x => x.number > index || x.number < 500)
    }
    for (const step of newSteps) {
      if (step.references && step.references.includes(index)) {
        step.references = undefined
        step.label = undefined
      }
    }
    this.exercise.steps.newSet(newSteps)
    this.updateSteps()
    this.updateStepnrSelectors()
  }

  insertStepAbove () {
    this.setStep()
    this.exercise.activeCase.insertStepAbove(this.activeStepIndex)
    this.activeStepIndex += 1
    this.updateSteps()
    this.setInput()
    this.updateCases()
  }

  insertStepBelow () {
    this.setStep()
    this.exercise.activeCase.insertStepBelow(this.activeStepIndex)
    this.updateSteps()
    this.updateCases()
  }

  deleteStep () {
    if (this.activeStepIndex === this.exercise.activeCase.steps.length - 1) {
      this.moveStepUp()
      this.exercise.activeCase.deleteStep(this.activeStepIndex + 1)
    } else {
      this.moveStepDown()
      this.exercise.activeCase.deleteStep(this.activeStepIndex - 1)
      this.activeStepIndex -= 1
    }

    this.updateSteps()
    this.updateCases()
  }

  deleteCase (index, type) {
    this.exercise.deleteCase(index, type)
    this.updateCases()
  }

  editCase (index, type) {
    // console.log(index, this.exercise.cases.cases[index])
    this.exercise.activeCase = this.exercise.getCase(index, type)
    document.getElementById('rule').value = `logic.propositional.logind.${this.exercise.activeCase.type}`
    document.getElementById('exercise-step-table').style.display = ''

    // this.deleteCase(index, type)
    this.activeStepIndex = null
    this.updateCases()
    this.updateSteps()
    this.setInput()
  }

  setStep () {
    if (this.activeStepIndex === null) {
      return
    }
    this.exercise.activeCase.steps[this.activeStepIndex].setTerm(document.getElementById('formula').value)
    if (this.activeStepIndex !== 0) {
      this.exercise.activeCase.steps[this.activeStepIndex].relation = document.getElementById('relation').value
      this.exercise.activeCase.steps[this.activeStepIndex].rule = document.getElementById('motivation').value
    }
    this.updateCases()
  }

  setInput () {
    if (this.activeStepIndex === null) {
      document.getElementById('active-step').style.display = 'none'
      document.getElementById('add-row').style.display = 'none'
      return
    }
    document.getElementById('active-step').style.display = ''
    document.getElementById('add-row').style.display = ''
    document.getElementById('relation').value = this.exercise.activeCase.steps[this.activeStepIndex].relation
    document.getElementById('formula').value = this.exercise.activeCase.steps[this.activeStepIndex].term
    document.getElementById('motivation').value = this.exercise.activeCase.steps[this.activeStepIndex].rule
  }

  kbCallback () {
    this.setStep()
  }

  moveToStep (index) {
    this.setStep()
    this.activeStepIndex = index
    this.setInput()

    this.updateSteps()
  }

  moveStepUp () {
    if (this.activeStepIndex === 0) {
      return
    }

    this.moveToStep(this.activeStepIndex - 1)
  }

  moveStepDown () {
    if (this.activeStepIndex === this.exercise.activeCase.steps.length - 1) {
      return
    }

    this.moveToStep(this.activeStepIndex + 1)
  }

  updateSteps () {
    this.clearErrors() // verwijder alle voorgaande foutmeldingen van het scherm

    const exerciseStepTable = document.getElementById('exercise-step-table')
    const steps = document.querySelectorAll('.case-step-row')
    for (const step of steps) {
      exerciseStepTable.removeChild(step)
    }

    for (const step of this.exercise.activeCase.steps) {
      this.insertStep(step)
    }

    document.getElementById('relation').style.display = this.activeStepIndex === 0 ? 'none' : ''
    document.getElementById('motivation').style.display = this.activeStepIndex === 0 ? 'none' : ''

    this.disableUI(false)
  }

  updateCases () {
    this.clearErrors() // verwijder alle voorgaande foutmeldingen van het scherm

    const exerciseStepTable = document.getElementById('exercise-case-table')
    exerciseStepTable.innerHTML = ''

    this.insertCaseHeader('baseCases', this.exercise.baseCasesStatus)
    for (const _case of this.exercise.cases.baseCases) {
      this.insertCase(_case)
    }
    if (this.exercise.cases.baseCases.length === 0) {
      this.insertCaseMessage('no_base_case')
    }

    this.insertCaseHeader('hypotheses', this.exercise.hypothesesStatus)
    for (const _case of this.exercise.cases.hypotheses) {
      this.insertCase(_case)
    }

    this.insertCaseHeader('inductiveSteps', this.exercise.inductiveStepsStatus)
    for (const _case of this.exercise.cases.inductiveSteps) {
      this.insertCase(_case)
    }

    this.disableUI(false)
  }
}
