import jsrender from 'jsrender'
import 'bootstrap'
import 'iframe-resizer'
import 'bootstrap/dist/css/bootstrap.min.css'
import '@fortawesome/fontawesome-free/js/fontawesome'
import '@fortawesome/fontawesome-free/js/solid'
import '@fortawesome/fontawesome-free/js/regular'
import '@fortawesome/fontawesome-free/js/brands'
import 'katex/dist/katex.min.css'
import katex from 'katex'

import { FormulaPopover } from '../kbinput.js'

// import { IdeasServiceProxy } from '../model/ideasServiceProxy.js'
import { LogEXSession } from '../logEXSession.js'
import { ExerciseTypes } from '../model/exerciseTypes.js'
import { LogAxExerciseGenerator } from '../model/logax/exerciseGenerator.js'
import { LogAxExerciseSolver } from '../model/logax/exerciseSolver.js'
import { LogAxExerciseValidator } from '../model/logax/exerciseValidator.js'
import { LogAxStep } from '../model/logax/step.js'
import { SyntaxValidator } from '../model/syntaxValidator.js'
import { LogAxExercise } from '../model/logax/exercise.js'
import { ExerciseController } from './ExerciseController.js'
import { translate, translateElement, loadLanguage, hasTranslation } from '../translate.js'

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
    this.ruleKey = null
    this.hoverNumber = null
    this.formulaOptions = {
      unaryOperators: ['¬'],
      binaryOperators: ['→', ','],
      implicitAssociativeBinaryOperators: [','],
      firstOrderOperators: [','],
      implicitPrecendence: [{ strong: ',', weak: '→' }],
      literals: ['p', 'q', 'r', 's']
    }
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
        spaces: 'lr'
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
      }
    ]
    this.newExerciseCharacterOptions = [
      {
        char: '¬',
        latex: '\\neg',
        triggers: ['-', 'n', '1', '`', '!', 'N']
      },
      {
        char: '→',
        latex: '\\rightarrow',
        triggers: ['i', '.', 'I'],
        spaces: 'lr'
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
        char: 't',
        latex: 't',
        triggers: ['T'],
        charStyled: '<i>t</i>'
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
        triggers: [','],
        spaces: 'r'
      }
    ]
    this.setExampleExercises()
    // this.bindExampleExercises()

    this.exerciseGenerator = new LogAxExerciseGenerator(this.config)
    this.exerciseSolver = new LogAxExerciseSolver(this.config)
    // validation
    this.exerciseValidator = new LogAxExerciseValidator(this.config)
    this.syntaxValidator = new SyntaxValidator()

    this.initializeInput()

    document.getElementById('renumber-step').addEventListener('click', function () {
      this.renumberSteps()
    }.bind(this))

    document.getElementById('undo-step').addEventListener('mousedown', function () {
      this.undoStep()
    }.bind(this))

    document.getElementById('redo-step').addEventListener('mousedown', function () {
      this.redoStep()
    }.bind(this))

    document.getElementById('complete-exercise').addEventListener('click', function () {
      this.completeSolution()
    }.bind(this))

    // Create exercise buttons
    document.getElementById('add-lemma').addEventListener('click', function () {
      document.getElementById('add-lemma-row').style.display = 'none'
      document.getElementById('lemma-row').style.display = ''
    })
    document.getElementById('remove-lemma').addEventListener('click', function () {
      document.getElementById('add-lemma-row').style.display = ''
      document.getElementById('lemma-row').style.display = 'none'
    })
  }

  /**
        Creates the popover for the input of symbols
    */
  initializeInput () {
    const assumptionOptions = {
      id: 1,
      characters: this.characterOptions
    }
    const axiomAOptions1 = {
      id: 2,
      characters: this.characterOptions
    }
    const axiomAOptions2 = {
      id: 3,
      characters: this.characterOptions
    }
    const axiomBOptions1 = {
      id: 4,
      characters: this.characterOptions
    }
    const axiomBOptions2 = {
      id: 5,
      characters: this.characterOptions
    }
    const axiomBOptions3 = {
      id: 6,
      characters: this.characterOptions
    }
    const axiomCOptions1 = {
      id: 7,
      characters: this.characterOptions
    }
    const axiomCOptions2 = {
      id: 8,
      characters: this.characterOptions
    }
    const deductionOptions = {
      id: 9,
      characters: this.characterOptions
    }
    const goalPhiOptions = {
      id: 11,
      characters: this.newExerciseCharacterOptions
    }
    const goalPsiOptions = {
      id: 12,
      characters: this.newExerciseCharacterOptions
    }
    const newFormula1Options = {
      id: 13,
      characters: this.newExerciseCharacterOptions
    }
    const newFormula2Options = {
      id: 14,
      characters: this.newExerciseCharacterOptions
    }
    const newLemma1Options = {
      id: 13,
      characters: this.newExerciseCharacterOptions
    }
    const newLemma2Options = {
      id: 14,
      characters: this.newExerciseCharacterOptions
    }
    this.assumptionPopover = new FormulaPopover(document.getElementById('assumption-formula-phi'), document.getElementById('assumption-phi-input'), assumptionOptions, this.applyReady.bind(this))
    this.axiomAPopover1 = new FormulaPopover(document.getElementById('axiom-a-formula-phi'), document.getElementById('axiom-a-phi-input'), axiomAOptions1, this.applyReady.bind(this))
    this.axiomAPopover2 = new FormulaPopover(document.getElementById('axiom-a-formula-psi'), document.getElementById('axiom-a-psi-input'), axiomAOptions2, this.applyReady.bind(this))
    this.axiomBPopover1 = new FormulaPopover(document.getElementById('axiom-b-formula-phi'), document.getElementById('axiom-b-phi-input'), axiomBOptions1, this.applyReady.bind(this))
    this.axiomBPopover2 = new FormulaPopover(document.getElementById('axiom-b-formula-psi'), document.getElementById('axiom-b-psi-input'), axiomBOptions2, this.applyReady.bind(this))
    this.axiomBPopover3 = new FormulaPopover(document.getElementById('axiom-b-formula-chi'), document.getElementById('axiom-b-chi-input'), axiomBOptions3, this.applyReady.bind(this))
    this.axiomCPopover1 = new FormulaPopover(document.getElementById('axiom-c-formula-phi'), document.getElementById('axiom-c-phi-input'), axiomCOptions1, this.applyReady.bind(this))
    this.axiomCPopover2 = new FormulaPopover(document.getElementById('axiom-c-formula-psi'), document.getElementById('axiom-c-psi-input'), axiomCOptions2, this.applyReady.bind(this))
    this.deductionPopover = new FormulaPopover(document.getElementById('deduction-formula-phi'), document.getElementById('deduction-phi-input'), deductionOptions, this.applyReady.bind(this))
    this.goalPhiPopover = new FormulaPopover(document.getElementById('goal-formula-phi'), document.getElementById('goal-phi-input'), goalPhiOptions, this.applyReady.bind(this))
    this.goalPsiPopover = new FormulaPopover(document.getElementById('goal-formula-psi'), document.getElementById('goal-psi-input'), goalPsiOptions, this.applyReady.bind(this))

    this.newFormula1Popover = new FormulaPopover(document.getElementById('new-formula-1'), document.getElementById('new-input-1'), newFormula1Options)
    this.newFormula2Popover = new FormulaPopover(document.getElementById('new-formula-2'), document.getElementById('new-input-2'), newFormula2Options)
    this.newLemma1Popover = new FormulaPopover(document.getElementById('new-lemma-1'), document.getElementById('new-lemma-input-1'), newLemma1Options)
    this.newLemma2Popover = new FormulaPopover(document.getElementById('new-lemma-2'), document.getElementById('new-lemma-input-2'), newLemma2Options)

    // apply
    const applyButton = document.getElementById('validate-step')
    applyButton.disabled = true

    const stepnrSelectors = document.querySelectorAll('.stepnr-select')
    for (const stepnrSelector of stepnrSelectors) {
      stepnrSelector.addEventListener('change', this.applyReady.bind(this))
    }
  }

  initializeRules (ruleElement) {
    let rules = this.config.rules.map(rule => rule.split('.')[3])
      .filter((value, index, self) => self.indexOf(value) === index)
      .map(baseRule => `logic.propositional.axiomatic.${baseRule}`)
    if (this.exercise.lemmas.length === 0) {
      rules = rules.filter(x => x !== 'logic.propositional.axiomatic.lemma')
    }
    super.initializeRules(ruleElement, rules)
    const subSelect = document.getElementById('subtype-select')

    ruleElement.addEventListener('change', function () {
      this.clearErrors()
      this.updateRuleVisibility(ruleElement, subSelect)
      this.applyReady()
    }.bind(this))

    subSelect.addEventListener('change', function () {
      this.clearErrors()
      this.updateRuleVisibility(ruleElement, subSelect)
      this.applyReady()
    }.bind(this))
  }

  updateRuleVisibility (ruleElement, subSelect) {
    const elements = document.querySelectorAll('[rule]')
    for (const element of elements) {
      element.style.display = 'none'
    }

    const baseRule = ruleElement.selectedOptions[0].getAttribute('translate-key').substring(5) // Remove 'rule.'
    const simpleRule = baseRule.split('.')[baseRule.split('.').length - 1]

    if (simpleRule !== 'selectRule') {
      document.getElementById('rule-definition-row').style.display = ''
      if (simpleRule === 'lemma') {
        document.getElementById('rule-definition').setAttribute('translate-key', '')
        document.getElementById('rule-definition').innerHTML = katex.renderToString(LogAxStep.convertToLatex(this.exercise.lemmas[0]), {
          throwOnError: false
        })
      } else {
        translateElement(document.getElementById('rule-definition'), `logax.rule.${simpleRule}.def`)
      }
    } else {
      document.getElementById('rule-definition-row').style.display = 'none'
    }

    let rule = baseRule

    if (this.config.rules.includes(`${baseRule}.forward`)) {
      document.getElementById('subtype-select-row').style.display = 'none'
    } else {
      if (this.config.rules.includes(`${baseRule}.close`)) {
        document.getElementById('subtype-select-row').style.display = ''
        rule = baseRule + (subSelect.selectedIndex === 1 ? '.close' : '')
      } else {
        document.getElementById('subtype-select-row').style.display = 'none'
      }
    }

    this.ruleKey = rule

    const selectedElements = document.querySelectorAll(`[rule='${rule}']`)
    for (const element of selectedElements) {
      element.style.display = ''
    }
  }

  /**
        Shows the form for creating a new exercise
     */
  newExercise () {
    super.newExercise()
    translateElement(document.getElementById('instruction'), 'logax.instruction.create')
  }

  /**
        Creates a new exercise
     */

  createExercise () {
    const exerciseMethod = ExerciseTypes[this.exerciseType]
    const properties = {
      titleKey: 'shared.exerciseName.user'
    }

    const formula1 = LogAxStep.convertToText(document.getElementById('new-formula-1').value)
    const formula2 = LogAxStep.convertToText(document.getElementById('new-formula-2').value)
    const proof = [{
      term: `${formula1} |- ${formula2}`,
      number: 1000
    }]
    const term = {
      proof: proof,
      lemmas: []
    }

    if (!this.validateFormula(document.getElementById('new-formula-1'), this.newExerciseAlert)) {
      return
    }

    if (!this.validateFormula(document.getElementById('new-formula-2'), this.newExerciseAlert)) {
      return
    }

    if (document.getElementById('lemma-row').style.display === '') {
      const lemma1 = LogAxStep.convertToText(document.getElementById('new-lemma-1').value)
      const lemma2 = LogAxStep.convertToText(document.getElementById('new-lemma-2').value)
      proof.unshift({
        term: `${lemma1} |- ${lemma2}`,
        number: 1,
        label: 'lemma'
      })
      term.lemmas = [`${lemma1} |- ${lemma2}`]
      if (!this.validateFormula(document.getElementById('new-lemma-1'), this.newExerciseAlert)) {
        return
      }

      if (!this.validateFormula(document.getElementById('new-lemma-2'), this.newExerciseAlert)) {
        return
      }
    }

    const context = {
      term: term,
      environment: {},
      location: []
    }

    this.disableUI(true)
    this.dismissAlert()
    this.exercise = new LogAxExercise(term, exerciseMethod, properties)
    this.exerciseGenerator.create(exerciseMethod, context, properties, this.showExercise.bind(this), this.onErrorCreatingExercise.bind(this))
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
    document.getElementById('rule').selectedIndex = 0
    this.initializeRules(document.getElementById('rule'))
    this.updateRuleVisibility(document.getElementById('rule'), document.getElementById('subtype-select'))
    document.getElementById('exercise-container').style.display = ''
    document.getElementById('rule-container').style.display = ''
    document.getElementById('completed-rule-container').style.display = 'none'
    document.getElementById('new-exercise-container').style.display = 'none'
    document.getElementById('undo-step').disabled = true
    document.getElementById('redo-step').disabled = true
    this.clearErrors()

    // Remove old rows
    const exerciseStepTable = document.getElementById('exercise-step-table')
    let stepRow = exerciseStepTable.firstElementChild
    while (true) {
      if (stepRow && stepRow.classList.contains('exercise-step')) {
        exerciseStepTable.removeChild(stepRow)
        stepRow = exerciseStepTable.firstElementChild
      } else {
        break
      }
    }
    document.getElementById('header-actions').style.display = ''

    let lemma = null

    if (this.exercise.lemmas.length > 0) {
      lemma = LogAxStep.convertToLatex(this.exercise.lemmas[0])
    }

    if (lemma === null) {
      translateElement(document.getElementById('instruction'), 'logax.instruction.exercise', {
        theorem: this.exercise.theoremKatex,
        title: {
          key: this.exercise.titleKey,
          params: this.exercise.titleParams
        }
      })
    } else {
      translateElement(document.getElementById('instruction'), 'logax.instruction.exerciseWithLemma', {
        theorem: this.exercise.theoremKatex,
        lemma: lemma,
        title: {
          key: this.exercise.titleKey,
          params: this.exercise.titleParams
        }
      })
    }
    this.updateSteps()
  }

  showSolution () {
    const term = {
      lemmas: this.exercise.lemmas,
      proof: [{
        term: this.exercise.theorem,
        number: 1000
      }]
    }
    window.open('logaxsolution.html?formula=' + encodeURIComponent(JSON.stringify(term)) + '&exerciseType=' + this.exercise.type + '&controller=' + this.exerciseType, '_blank', 'location=no,width=1020,height=600,status=no,toolbar=no')
  }

  completeSolution () {
    window.open('logaxsolution.html?formula=' + encodeURIComponent(JSON.stringify(this.exercise.getObject())) + '&exerciseType=' + this.exercise.type + '&controller=' + this.exerciseType, '_blank', 'location=no,width=1020,height=600,status=no,toolbar=no')
  }

  getNewStep () {
    const rule = this.ruleKey

    switch (rule) {
      case 'logic.propositional.axiomatic.assumption': {
        const newFormula = document.getElementById('assumption-formula-phi')
        return {
          environment: {
            phi: LogAxStep.convertToText(newFormula.value)
          },
          rule: rule
        }
      }
      case 'logic.propositional.axiomatic.assumption.close': {
        const stepnr = document.getElementById('assumption-select-stepnr')
        return {
          environment: {
            n: stepnr.value
          },
          rule: rule
        }
      }
      case 'logic.propositional.axiomatic.axiom-a': {
        const phi = document.getElementById('axiom-a-formula-phi')
        const psi = document.getElementById('axiom-a-formula-psi')
        return {
          environment: {
            phi: LogAxStep.convertToText(phi.value),
            psi: LogAxStep.convertToText(psi.value)
          },
          rule: rule
        }
      }
      case 'logic.propositional.axiomatic.axiom-a.close': {
        const stepnr = document.getElementById('axiom-a-select-stepnr')
        return {
          environment: {
            n: stepnr.value
          },
          rule: rule
        }
      }
      case 'logic.propositional.axiomatic.axiom-b': {
        const phi = document.getElementById('axiom-b-formula-phi')
        const psi = document.getElementById('axiom-b-formula-psi')
        const chi = document.getElementById('axiom-b-formula-chi')
        return {
          environment: {
            phi: LogAxStep.convertToText(phi.value),
            psi: LogAxStep.convertToText(psi.value),
            chi: LogAxStep.convertToText(chi.value)
          },
          rule: rule
        }
      }
      case 'logic.propositional.axiomatic.axiom-b.close': {
        const stepnr = document.getElementById('axiom-b-select-stepnr')
        return {
          environment: {
            n: stepnr.value
          },
          rule: rule
        }
      }
      case 'logic.propositional.axiomatic.axiom-c': {
        const phi = document.getElementById('axiom-c-formula-phi')
        const psi = document.getElementById('axiom-c-formula-psi')
        return {
          environment: {
            phi: LogAxStep.convertToText(phi.value),
            psi: LogAxStep.convertToText(psi.value)
          },
          rule: rule
        }
      }
      case 'logic.propositional.axiomatic.axiom-c.close': {
        const stepnr = document.getElementById('axiom-c-select-stepnr')
        return {
          environment: {
            n: stepnr.value
          },
          rule: rule
        }
      }
      case 'logic.propositional.axiomatic.modusponens': {
        const stepnr1 = document.getElementById('modusponens-select-stepnr-1')
        const stepnr2 = document.getElementById('modusponens-select-stepnr-2')
        const stepnr3 = document.getElementById('modusponens-select-stepnr-3')
        return {
          environment: {
            n1: stepnr1.value,
            n2: stepnr2.value,
            n3: stepnr3.value
          },
          rule: rule
        }
      }
      case 'logic.propositional.axiomatic.deduction': {
        const stepnr1 = document.getElementById('deduction-select-stepnr-1')
        const phi = document.getElementById('deduction-formula-phi')
        const stepnr2 = document.getElementById('deduction-select-stepnr-2')

        if (stepnr1.value !== '' && phi.value !== '') {
          return {
            environment: {
              n: stepnr1.value,
              phi: LogAxStep.convertToText(phi.value)
            },
            rule: `${rule}.forward`
          }
        }

        if (stepnr1.value === '' && stepnr2.value !== '') {
          return {
            environment: {
              n: stepnr2.value
            },
            rule: `${rule}.backward`
          }
        }

        if (stepnr1.value !== '' && stepnr2.value !== '') {
          return {
            environment: {
              n1: stepnr1.value,
              n2: stepnr2.value
            },
            rule: `${rule}.close`
          }
        }
        return
      }
      case 'logic.propositional.axiomatic.goal': {
        const phi = document.getElementById('goal-formula-phi')
        const psi = document.getElementById('goal-formula-psi')
        const stepnr = document.getElementById('goal-select-stepnr')

        if (stepnr.value === '') {
          return {
            environment: {
              st: `${LogAxStep.convertToText(phi.value)} |- ${LogAxStep.convertToText(psi.value)}`
            },
            rule: `${rule}1`
          }
        } else {
          return {
            environment: {
              n: stepnr.value,
              st: `${LogAxStep.convertToText(phi.value)} |- ${LogAxStep.convertToText(psi.value)}`
            },
            rule: rule
          }
        }
      }
      case 'logic.propositional.axiomatic.lemma': {
        const stepnr = document.getElementById('lemma-select-stepnr')

        if (stepnr.value === '') {
          return {
            environment: {
              st: this.exercise.lemmas[0]
            },
            rule: rule
          }
        } else {
          return {
            environment: {
              n: stepnr.value,
              st: this.exercise.lemmas[0]
            },
            rule: rule
          }
        }
      }
      case 'logic.propositional.axiomatic.lemma.close': {
        const stepnr = document.getElementById('lemma-select-close-stepnr')

        return {
          environment: {
            n: stepnr.value,
            st: this.exercise.lemmas[0]
          },
          rule: rule
        }
      }
    }
  }

  disableUI (disable) {
    super.disableUI(disable)
    this.applyReady()
  }

  applyReady () {
    const rule = this.ruleKey
    const applyButton = document.getElementById('validate-step')
    applyButton.disabled = true

    switch (rule) {
      case 'logic.propositional.axiomatic.assumption': {
        const newFormula = document.getElementById('assumption-formula-phi')
        if (newFormula.value !== '') {
          applyButton.disabled = false
        }
        break
      }
      case 'logic.propositional.axiomatic.assumption.close': {
        const stepnr = document.getElementById('assumption-select-stepnr')
        if (stepnr.value !== '') {
          applyButton.disabled = false
        }
        break
      }
      case 'logic.propositional.axiomatic.axiom-a': {
        const phi = document.getElementById('axiom-a-formula-phi')
        const psi = document.getElementById('axiom-a-formula-psi')
        if (phi.value !== '' && psi.value !== '') {
          applyButton.disabled = false
        }
        break
      }
      case 'logic.propositional.axiomatic.axiom-a.close': {
        const stepnr = document.getElementById('axiom-a-select-stepnr')
        if (stepnr.value !== '') {
          applyButton.disabled = false
        }
        break
      }
      case 'logic.propositional.axiomatic.axiom-b': {
        const phi = document.getElementById('axiom-b-formula-phi')
        const psi = document.getElementById('axiom-b-formula-psi')
        const chi = document.getElementById('axiom-b-formula-chi')
        if (phi.value !== '' && psi.value !== '' && chi.value !== '') {
          applyButton.disabled = false
        }
        break
      }
      case 'logic.propositional.axiomatic.axiom-b.close': {
        const stepnr = document.getElementById('axiom-b-select-stepnr')
        if (stepnr.value !== '') {
          applyButton.disabled = false
        }
        break
      }
      case 'logic.propositional.axiomatic.axiom-c': {
        const phi = document.getElementById('axiom-c-formula-phi')
        const psi = document.getElementById('axiom-c-formula-psi')
        if (phi.value !== '' && psi.value !== '') {
          applyButton.disabled = false
        }
        break
      }
      case 'logic.propositional.axiomatic.axiom-c.close': {
        const stepnr = document.getElementById('axiom-c-select-stepnr')
        if (stepnr.value !== '') {
          applyButton.disabled = false
        }
        break
      }
      case 'logic.propositional.axiomatic.modusponens': {
        const stepnr1 = document.getElementById('modusponens-select-stepnr-1')
        const stepnr2 = document.getElementById('modusponens-select-stepnr-2')
        const stepnr3 = document.getElementById('modusponens-select-stepnr-3')

        if (stepnr1.value !== '' && stepnr2.value !== '') {
          applyButton.disabled = false
        }
        if (stepnr1.value !== '' && stepnr3.value !== '') {
          applyButton.disabled = false
        }
        if (stepnr2.value !== '' && stepnr3.value !== '') {
          applyButton.disabled = false
        }
        if (stepnr1.value !== '' && stepnr2.value !== '' && stepnr3.value !== '') {
          applyButton.disabled = false
        }
        break
      }
      case 'logic.propositional.axiomatic.deduction': {
        const stepnr1 = document.getElementById('deduction-select-stepnr-1')
        const phi = document.getElementById('deduction-formula-phi')
        const stepnr2 = document.getElementById('deduction-select-stepnr-2')

        if (stepnr1.value !== '' && phi.value !== '') {
          applyButton.disabled = false
        }

        if (stepnr2.value !== '') {
          applyButton.disabled = false
        }

        stepnr2.disabled = (phi.value !== '')
        phi.disabled = (stepnr2.value !== '')

        break
      }
      case 'logic.propositional.axiomatic.goal': {
        const phi = document.getElementById('goal-formula-phi')
        const psi = document.getElementById('goal-formula-psi')

        if (phi.value !== '' && psi.value !== '') {
          applyButton.disabled = false
        }
        break
      }
      case 'logic.propositional.axiomatic.lemma': {
        applyButton.disabled = false
        break
      }
      case 'logic.propositional.axiomatic.lemma.close': {
        const stepnr = document.getElementById('lemma-select-close-stepnr')
        if (stepnr.value !== '') {
          applyButton.disabled = false
        }
        break
      }
    }
  }

  validateFormulas () {
    const rule = this.ruleKey

    switch (rule) {
      case 'logic.propositional.axiomatic.assumption': {
        const phi = document.getElementById('assumption-formula-phi')
        return this.validateFormula(phi, this.exerciseAlert)
      }
      case 'logic.propositional.axiomatic.assumption.close': {
        return true
      }
      case 'logic.propositional.axiomatic.axiom-a': {
        const phi = document.getElementById('axiom-a-formula-phi')
        const psi = document.getElementById('axiom-a-formula-psi')

        if (this.validateFormula(phi, this.exerciseAlert)) {
          return this.validateFormula(psi, this.exerciseAlert)
        } else {
          return false
        }
      }
      case 'logic.propositional.axiomatic.axiom-a.close': {
        return true
      }
      case 'logic.propositional.axiomatic.axiom-b': {
        const phi = document.getElementById('axiom-b-formula-phi')
        const psi = document.getElementById('axiom-b-formula-psi')
        const chi = document.getElementById('axiom-b-formula-chi')

        if (this.validateFormula(phi, this.exerciseAlert)) {
          if (this.validateFormula(psi, this.exerciseAlert)) {
            return this.validateFormula(chi, this.exerciseAlert)
          } else {
            return false
          }
        } else {
          return false
        }
      }
      case 'logic.propositional.axiomatic.axiom-b.close': {
        return true
      }
      case 'logic.propositional.axiomatic.axiom-c': {
        const phi = document.getElementById('axiom-c-formula-phi')
        const psi = document.getElementById('axiom-c-formula-psi')

        if (this.validateFormula(phi, this.exerciseAlert)) {
          return this.validateFormula(psi, this.exerciseAlert)
        } else {
          return false
        }
      }
      case 'logic.propositional.axiomatic.axiom-c.close': {
        return true
      }
      case 'logic.propositional.axiomatic.modusponens': {
        return true
      }
      case 'logic.propositional.axiomatic.deduction': {
        const stepnr1 = document.getElementById('deduction-select-stepnr-1')
        const phi = document.getElementById('deduction-formula-phi')
        const stepnr2 = document.getElementById('deduction-select-stepnr-2')

        if (stepnr1.value !== '' && phi.value !== '') {
          return this.validateFormula(phi, this.exerciseAlert)
        }

        if (phi.value !== '' && stepnr2.value !== '') {
          return this.validateFormula(phi, this.exerciseAlert)
        }

        if (stepnr2.value !== '') {
          return true
        }

        break
      }
      case 'logic.propositional.axiomatic.goal': {
        const phi = document.getElementById('goal-formula-phi')
        const psi = document.getElementById('goal-formula-psi')

        if (this.validateFormula(phi, this.exerciseAlert)) {
          return this.validateFormula(psi, this.exerciseAlert)
        } else {
          return false
        }
      }
      case 'logic.propositional.axiomatic.lemma': {
        return true
      }
      case 'logic.propositional.axiomatic.lemma.close': {
        return true
      }
    }
  }

  /**
    Validates a step
      Runs callback after correct step has been validated
     */
  validateStep () {
    if (this.ruleKey === null) {
      this.setErrorLocation('rule')
      this.updateAlert('shared.error.noRule', null, 'error')
      return false
    }

    if (!this.validateFormulas()) {
      return false
    }

    const newStep = this.getNewStep()

    this.disableUI(true)
    this.clearErrors()
    this.exerciseValidator.validateApply(this.exercise, newStep, this.onStepValidated.bind(this), this.onErrorValidatingStep.bind(this))
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
  onStepValidated (newSet) {
    this.exercise.steps.newSet(newSet)

    this.updateSteps()

    //    Reset rule value after valid step
    document.getElementById('undo-step').disabled = false
    document.getElementById('redo-step').disabled = true
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
    if (nextStep.stepEnvironment.subgoals !== '') {
      const subgoal = nextStep.stepEnvironment.subgoals.split(';')[0]
      this.updateAlert('logax.hint.proveSubgoal', { subgoal: LogAxStep.convertToLatex(subgoal) }, 'hint', 'shared.hint.nextHint', buttonCallback)
      return
    }

    if (nextStep.formula.proof.length === this.exercise.steps.steps.length) {
      this.updateAlert('logax.hint.motivate', { subgoal: LogAxStep.convertToLatex(nextStep.stepEnvironment.subgoals) }, 'hint', 'shared.hint.nextHint', buttonCallback)
      return
    }

    for (let i = 0; i < nextStep.formula.proof.length; i++) {
      if (nextStep.formula.proof[i].number !== this.exercise.steps.steps[i].number) {
        // Found new step
        for (let j = 0; j < nextStep.formula.proof.length; j++) {
          // Determine which step references new step and if the new step is inserted before or after the old step
          if (nextStep.formula.proof[j].references !== undefined && nextStep.formula.proof[j].references.includes(nextStep.formula.proof[i].number)) {
            if (nextStep.formula.proof[j].number < nextStep.formula.proof[i].number) {
              this.updateAlert('logax.hint.performForward', { subgoal: LogAxStep.convertToLatex(nextStep.stepEnvironment.subgoals) }, 'hint', 'shared.hint.nextHint', buttonCallback)
              return
            } else {
              this.updateAlert('logax.hint.performBackward', { subgoal: LogAxStep.convertToLatex(nextStep.stepEnvironment.subgoals) }, 'hint', 'shared.hint.nextHint', buttonCallback)
              return
            }
          }
        }
        // No references to new step; the step should be performed forward
        this.updateAlert('logax.hint.performForward', { subgoal: LogAxStep.convertToLatex(nextStep.stepEnvironment.subgoals) }, 'hint', 'shared.hint.nextHint', buttonCallback)
        return
      }
    }
  }

  showNextHint (nextStep) {
    const buttonCallback = function () {
      this.doNextStep(nextStep)
    }.bind(this)
    this.updateAlert(`logax.hint.applyRule.${nextStep.rule}`, null, 'hint', 'shared.hint.autoStep', buttonCallback)
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
    this.onStepValidated(nextStep.formula.proof)
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

  renumberSteps () {
    const renumberStep = {
      rule: 'logic.propositional.axiomatic.renumber',
      environment: {}
    }
    const callback = function (newSet) {
      // Don't highlight steps after renumbering
      this.onStepValidated(newSet)
      for (const step of this.exercise.steps.steps) {
        step.highlightStep = false
        step.highlightTerm = false
        step.highlightRule = false
      }
      this.updateSteps()
      this.removeDeleteButtons()
    }.bind(this)
    this.exerciseValidator.validateApply(this.exercise, renumberStep, callback, this.onErrorValidatingStep.bind(this))
  }

  insertStep (step, canDelete) {
    this.dismissAlert()

    const exerciseStep = document.createElement('tr')
    exerciseStep.classList.add('exercise-step')
    exerciseStep.setAttribute('number', step.number)
    exerciseStep.innerHTML = this.renderStep(step, canDelete)

    if (canDelete) {
      const deleteButton = exerciseStep.getElementsByClassName('delete-step')[0]
      deleteButton.addEventListener('mousedown', function () {
        this.removeStep(step.number)
      }.bind(this))
      deleteButton.addEventListener('mouseenter', function () {
        this.previewRemoveStep(step.number)
      }.bind(this))
      deleteButton.addEventListener('mouseleave', function () {
        this.resetRemoveStep()
      }.bind(this))
    }

    document.getElementById('exercise-step-table').appendChild(exerciseStep)
    this.updateStepnrSelectors()
  }

  updateStepnrSelectors () {
    const stepnrSelectors = document.querySelectorAll('.stepnr-select')
    for (const stepnrSelector of stepnrSelectors) {
      stepnrSelector.innerHTML = ''

      const emptyOption = document.createElement('option')
      translateElement(emptyOption, 'shared.button.selectStep')
      emptyOption.setAttribute('value', '')
      stepnrSelector.appendChild(emptyOption)

      for (const step of this.exercise.steps.steps) {
        const option = document.createElement('option')
        option.innerHTML = step.number
        stepnrSelector.appendChild(option)
      }
    }
  }

  renderStep (step, canDelete) {
    let rule = ''
    let references = ''
    const stepTemplate = $.templates('#exercise-step-template')

    if (step.ruleKey !== undefined) {
      rule = translate(step.ruleKey)
    }
    if (step.references !== undefined) {
      references = step.references.join(', ')
    }

    const exerciseStepHtml = stepTemplate.render({
      rule: rule,
      ruleKey: step.ruleKey,
      references: references,
      term: step.termKatex,
      canDelete: canDelete,
      step: step.number,
      highlightStep: step.highlightStep,
      highlightTerm: step.highlightTerm,
      highlightRule: step.highlightRule,
      deleteStep: step.deleteStep,
      deleteTerm: step.deleteTerm,
      deleteRule: step.deleteRule
    })

    return exerciseStepHtml
  }

  removeStep (index) {
    const removeStep = {
      rule: 'logic.propositional.axiomatic.removeline',
      environment: {
        n: index
      }
    }
    const callback = function (newSet) {
      this.exercise.steps.newSet(newSet)
      this.updateSteps()
      this.updateStepnrSelectors()
    }.bind(this)
    this.exerciseValidator.validateApply(this.exercise, removeStep, callback, this.onErrorValidatingStep.bind(this))
  }

  previewRemoveStep (index) {
    const removeStep = {
      rule: 'logic.propositional.axiomatic.removeline',
      environment: {
        n: index
      },
      requestInfo: 'tryout'
    }
    this.hoverNumber = index

    const callback = function (deleteSet) {
      if (this.hoverNumber !== index) {
        return
      }
      for (const step of this.exercise.steps.steps) {
        step.deleteStep = true
        step.deleteTerm = true
        step.deleteRule = true
        for (const responseStep of deleteSet) {
          const newStep = new LogAxStep(responseStep)
          // highlight differences
          if (step.number === newStep.number) {
            step.deleteStep = false
            if (step.rule === newStep.rule) {
              step.deleteRule = false
            }
            if (step.term === newStep.term) {
              step.deleteTerm = false
            }
            break
          }
        }
      }
      for (const element of document.getElementsByClassName('exercise-step')) {
        for (const step of this.exercise.steps.steps) {
          if (Number(element.getAttribute('number')) !== step.number) {
            continue
          }
          if (step.deleteStep) {
            element.getElementsByClassName('col-step')[0].classList.add('delete-text')
          } else {
            element.getElementsByClassName('col-step')[0].classList.remove('delete-text')
          }
          if (step.deleteTerm) {
            element.getElementsByClassName('col-term')[0].classList.add('delete-text')
          } else {
            element.getElementsByClassName('col-term')[0].classList.remove('delete-text')
          }
          if (step.deleteRule) {
            element.getElementsByClassName('col-rule')[0].classList.add('delete-text')
          } else {
            element.getElementsByClassName('col-rule')[0].classList.remove('delete-text')
          }
        }
      }
    }.bind(this)
    this.exerciseValidator.validateApply(this.exercise, removeStep, callback, this.onErrorValidatingStep.bind(this))
  }

  resetRemoveStep () {
    this.hoverNumber = null
    for (const step of this.exercise.steps.steps) {
      step.deleteStep = false
      step.deleteTerm = false
      step.deleteRule = false
    }
    const elements = document.getElementsByClassName('delete-text')
    while (elements[0]) {
      elements[0].classList.remove('delete-text')
    }
  }

  updateSteps () {
    this.clearErrors() // verwijder alle voorgaande foutmeldingen van het scherm

    const exerciseStepTable = document.getElementById('exercise-step-table')
    exerciseStepTable.innerHTML = ''

    for (const step of this.exercise.steps.steps) {
      this.insertStep(step, step.number !== 1000)
    }
    this.disableUI(false)
  }

  undoStep () {
    this.exercise.steps.setHistoryIndex(this.exercise.steps.stepsHistoryIndex - 1)
    this.updateSteps()
    document.getElementById('undo-step').disabled = this.exercise.steps.stepsHistoryIndex === 0
    document.getElementById('redo-step').disabled = false
    this.updateStepnrSelectors()
  }

  redoStep () {
    this.exercise.steps.setHistoryIndex(this.exercise.steps.stepsHistoryIndex + 1)
    this.updateSteps()
    document.getElementById('redo-step').disabled = this.exercise.steps.stepsHistoryIndex === this.exercise.steps.stepsHistory.length - 1
    document.getElementById('undo-step').disabled = false
    this.updateStepnrSelectors()
  }
}
