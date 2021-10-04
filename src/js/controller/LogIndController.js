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

// import { IdeasServiceProxy } from '../model/ideasServiceProxy.js'
import { LogEXSession } from '../logEXSession.js'
import { LogIndExerciseGenerator } from '../model/logind/exerciseGenerator.js'
import { LogIndExerciseSolver } from '../model/logind/exerciseSolver.js'
import { LogIndExerciseValidator } from '../model/logind/exerciseValidator.js'
import { LogIndExercise } from '../model/logind/exercise.js'
import { LogIndCase } from '../model/logind/stepCollection.js'
import { SyntaxValidator } from '../model/syntaxValidator.js'
import { ExerciseController } from './ExerciseController.js'
import { translateChildren, loadLanguage, hasTranslation } from '../translate.js'
import { ExerciseTypes } from '../model/exerciseTypes.js'

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

    this.activeStepIndex = 0

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
    this.assumptionPopover = new FormulaPopover(document.getElementById('formula'), document.getElementById('formula-input'), formulaOptions, this.applyReady.bind(this))

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
    this.activeStepIndex = 0
    document.getElementById('rule').selectedIndex = 0
    this.initializeRules(document.getElementById('rule'))
    document.getElementById('exercise-container').style.display = ''
    document.getElementById('rule-container').style.display = ''
    document.getElementById('completed-rule-container').style.display = 'none'
    document.getElementById('instruction').innerHTML = this.exercise.problem
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

  /**
    Validates a step
      Runs callback after correct step has been validated
     */
  validateStep () {
    this.setStep()
    this.exercise.activeCase.index = this.exercise.cases.cases.length
    this.exercise.activeCase.type = this.getSelectedRuleKey()
    this.exercise.cases.cases.push(this.exercise.activeCase)
    this.exercise.activeCase = new LogIndCase(this.exercise)
    this.activeStepIndex = 0
    this.updateCases()
    this.updateSteps()
    this.setInput()

    // if (this.ruleKey === null) {
    //   this.setErrorLocation('rule')
    //   this.updateAlert('shared.error.noRule', null, 'error')
    //   return false
    // }

    // if (!this.validateFormulas()) {
    //   return false
    // }

    // const newStep = this.getNewStep()

    // this.disableUI(true)
    // this.clearErrors()
    // this.exerciseValidator.validateApply(this.exercise, newStep, this.onStepValidated.bind(this), this.onErrorValidatingStep.bind(this))
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
  onStepValidated () {
    this.updateSteps()

    //    Reset rule value after valid step
    document.getElementById('rule').selectedIndex = 0
    document.getElementById('rule').dispatchEvent(new Event('change', { bubbles: true }))
    // Check if ready
    for (const step of this.exercise.steps.steps) {
      if (step.label === undefined) {
        return true
      }
    }
    this.exerciseValidator.isFinished(this.exercise, this.onCompleted.bind(this), this.onErrorValidatingStep.bind(this))
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
      this.showNextHint(nextStep)
    }.bind(this)

    this.updateAlert('logind.hint.message', null, 'hint', 'shared.hint.nextHint', buttonCallback)
  }

  showNextHint (nextStep) {
    const buttonCallback = function () {
      this.doNextStep(nextStep)
    }.bind(this)
    this.updateAlert(`logind.hint.applyRule.${nextStep.rule}`, null, 'hint', 'shared.hint.autoStep', buttonCallback)
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
    this.exercise.setCases(nextStep.formula.proofs)
    console.log(this.exercise)
    this.setInput()
    this.updateSteps()
    this.updateCases()
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

  insertCase (_case) {
    const exerciseCaseDiv = document.createElement('template')
    exerciseCaseDiv.innerHTML = this.renderCase(_case)

    translateChildren(exerciseCaseDiv.content)

    exerciseCaseDiv.content.querySelector('.delete-case').addEventListener('click', function () {
      this.deleteCase(_case.index)
    }.bind(this))

    exerciseCaseDiv.content.querySelector('.edit-case').addEventListener('click', function () {
      this.editCase(_case.index)
    }.bind(this))

    const exerciseCaseTable = document.getElementById('exercise-case-table')
    exerciseCaseTable.appendChild(exerciseCaseDiv.content)
  }

  insertStep (step, canDelete) {
    this.dismissAlert()

    const exerciseStep = document.createElement('tr')
    exerciseStep.classList.add('case-step-row')
    exerciseStep.innerHTML = this.renderStep(step)

    // if (canDelete) {
    //   const deleteButton = exerciseStep.getElementsByClassName('delete-step')[0]
    //   deleteButton.addEventListener('click', function () {
    //     this.removeStep(step.number)
    //   }.bind(this))
    // }
    const exerciseStepTable = document.getElementById('exercise-step-table')
    if (step.number < this.activeStepIndex) {
      exerciseStepTable.insertBefore(exerciseStep, document.getElementById('active-step'))
    } else if (step.number > this.activeStepIndex) {
      exerciseStepTable.appendChild(exerciseStep)
    }
  }

  renderCase (_case, canDelete) {
    const stepTemplate = $.templates('#exercise-step-template')

    const newSteps = []

    for (const step of _case.steps) {
      newSteps.push(this.renderStep(step))
    }

    const exerciseStepHtml = stepTemplate.render({
      type: _case.type,
      steps: newSteps
    })

    return exerciseStepHtml
  }

  renderStep (step) {
    const stepTemplate = $.templates('#exercise-case-step-template')
    const exerciseStepHtml = stepTemplate.render({
      isEmptyFormula: step.term === '',
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
  }

  insertStepBelow () {
    this.setStep()
    this.exercise.activeCase.insertStepBelow(this.activeStepIndex)
    this.updateSteps()
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
  }

  deleteCase (index) {
    this.exercise.deleteCase(index)
    this.updateCases()
  }

  editCase (index) {
    console.log(index, this.exercise.cases.cases[index])
    this.exercise.activeCase = this.exercise.cases.cases[index]
    console.log(this.exercise)
    this.deleteCase(index)
    this.activeStepIndex = 0
    this.updateCases()
    this.updateSteps()
    this.setInput()
  }

  setStep () {
    this.exercise.activeCase.steps[this.activeStepIndex].setTerm(document.getElementById('formula').value)
    if (this.activeStepIndex !== 0) {
      this.exercise.activeCase.steps[this.activeStepIndex].relation = document.getElementById('relation').value
      this.exercise.activeCase.steps[this.activeStepIndex].rule = document.getElementById('motivation').value
    }
  }

  setInput () {
    document.getElementById('relation').value = this.exercise.activeCase.steps[this.activeStepIndex].relation
    document.getElementById('formula').value = this.exercise.activeCase.steps[this.activeStepIndex].term
    document.getElementById('motivation').value = this.exercise.activeCase.steps[this.activeStepIndex].rule
  }

  moveStepUp () {
    if (this.activeStepIndex === 0) {
      return
    }

    this.setStep()
    this.activeStepIndex -= 1
    this.setInput()

    this.updateSteps()
  }

  moveStepDown () {
    if (this.activeStepIndex === this.exercise.activeCase.steps.length - 1) {
      return
    }

    this.setStep()
    this.activeStepIndex += 1
    this.setInput()

    this.updateSteps()
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

    for (const _case of this.exercise.cases.cases) {
      this.insertCase(_case)
    }

    this.disableUI(false)
  }
}
