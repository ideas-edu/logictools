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
import { LogIndExercise } from '../model/logind/exercise.js'
import { LogIndCase } from '../model/logind/stepCollection.js'
import { unicodeToLatex, asciiToUnicode } from '../model/logind/step.js'
import { SyntaxValidator } from '../model/syntaxValidator.js'
import { ExerciseController } from './ExerciseController.js'
import { translateElement, translateElementPlaceholder, translateChildren, loadLanguage, hasTranslation } from '../translate.js'

const $ = jsrender(null)

const DEFINITIONS = ['max', 'min', 'union', 'set', 'del', 'subst']

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
    this.exerciseComplete = false
    this.ruleKey = null
    this.formulaOptions = {
      unaryOperators: ['¬', 'min', 'max'],
      binaryOperators: ['→', '∧', '∨', ',', '∪', '+', '-', '⋅', '\\'],
      ternaryOperators: [{ o1: '[', o2: '/', o3: ']' }],
      literals: ['p', 'q', 'r', 'φ', 'ψ', 'χ', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
      implicitAssociativeBinaryOperators: ['+', '⋅', '∪', ','],
      leftParentheses: ['(', '{'],
      rightParentheses: [')', '}']
    }
    this.characterOptions = []
    this.motivationOptions = []
    this.baseMotivations = ['calculate', 'ih', 'logic']

    this.setExampleExercises()

    this.exerciseGenerator = new LogIndExerciseGenerator(this.config)
    this.exerciseSolver = new LogIndExerciseSolver(this.config)
    // validation
    this.exerciseValidator = new LogIndExerciseValidator(this.config)
    this.syntaxValidator = new SyntaxValidator()

    this.initializeInput()

    document.getElementById('change-direction').addEventListener('mousedown', function () {
      if (this.proofDirection === 'down') {
        this.setProofDirection('up')
        return
      }
      if (this.proofDirection === 'up') {
        this.setProofDirection('down')
      }
    }.bind(this))

    document.getElementById('new-base-case').addEventListener('mousedown', function () {
      this.newCase('baseCase')
    }.bind(this))

    document.getElementById('new-hypothesis').addEventListener('mousedown', function () {
      this.newCase('hypothesis')
    }.bind(this))

    document.getElementById('new-inductive-step').addEventListener('mousedown', function () {
      this.newCase('inductiveStep')
    }.bind(this))

    document.getElementById('complete-exercise').addEventListener('click', function () {
      this.completeSolution()
    }.bind(this))
  }

  /**
        Creates the popover for the input of symbols
    */
  initializeInput () {
    const formulaOptionsTop = {
      id: 1,
      characters: this.characterOptions
    }
    const formulaOptionsBottom = {
      id: 2,
      characters: this.characterOptions
    }
    this.assumptionPopoverTop = new FormulaPopover(document.getElementById('formula-top'), document.getElementById('formula-input-top'), formulaOptionsTop)
    this.assumptionPopoverBottom = new FormulaPopover(document.getElementById('formula-bottom'), document.getElementById('formula-input-bottom'), formulaOptionsBottom)

    this.setMotivation(document.getElementById('motivation-top'))
    this.setMotivation(document.getElementById('motivation-bottom'))
  }

  setMotivation (motivationElement) {
    motivationElement.innerHTML = ''
    const select = document.createElement('option')
    translateElement(select, 'shared.button.selectMotivation')
    motivationElement.appendChild(select)
    for (const motivation of this.motivationOptions) {
      const option = document.createElement('option')
      option.value = motivation
      if ([].concat(this.baseMotivations).concat(this.exercise.motivations).includes(motivation)) {
        translateElement(option, `rule.logic.propositional.logind.${motivation}`)
      } else {
        translateElement(option, 'rule.logic.propositional.logind.definition', { function: motivation })
      }
      motivationElement.appendChild(option)
    }

    motivationElement.addEventListener('change', function () {
      this.clearErrors()
    }.bind(this))
  }

  /**
    */
  showExercise () {
    this.exerciseComplete = false
    document.getElementById('exercise-container').style.display = ''
    document.getElementById('rule-container').style.display = ''
    document.getElementById('completed-rule-container').style.display = 'none'
    document.getElementById('instruction').innerHTML = this.exercise.problem
    document.getElementById('formula-top').value = ''
    document.getElementById('formula-bottom').value = ''
    document.getElementById('relation-gap').value = '='
    document.getElementById('relation-top').value = '='
    document.getElementById('relation-bottom').value = '='
    translateElement(document.getElementById('instruction'), 'logind.instruction.exercise', {
      problem: this.exercise.problem,
      title: {
        key: this.exercise.titleKey,
        params: this.exercise.titleParams
      }
    })
    this.dismissAlert()
    this.clearErrors()

    this.characterOptions = [{
      char: 'φ',
      latex: '\\phi',
      triggers: ['ϕ', 'φ']
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
    },
    {
      char: '⋅',
      latex: '\\cdot',
      triggers: ['*', '∗'],
      spaces: 'lr'
    }]
    for (let i = 'a'.charCodeAt(0); i <= 'z'.charCodeAt(0); i++) {
      if (this.exercise.definitions.includes(String.fromCharCode(i))) {
        continue
      }
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
    for (const char of ['+', '-', '/', '(', ')', ',', '{', '}', '[', ']', '\\']) {
      this.characterOptions.push({
        char: char,
        triggers: [char],
        hideButton: true
      })
    }
    this.motivationOptions = [].concat(this.baseMotivations).concat(this.exercise.motivations)
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
      this.formulaOptions.unaryOperators.push(term)
      this.characterOptions.push({
        char: term,
        latex: `\\texttt{${term}}`,
        triggers: [],
        function: true
      })
      this.motivationOptions.push(term)
    }

    this.assumptionPopoverTop.options.characters = this.characterOptions
    this.assumptionPopoverTop.setContent()
    this.assumptionPopoverBottom.options.characters = this.characterOptions
    this.assumptionPopoverBottom.setContent()
    this.setMotivation(document.getElementById('motivation-top'))
    this.setMotivation(document.getElementById('motivation-bottom'))

    // document.getElementById('header-actions').style.display = ''
    this.setProofDirection('none')
    this.updateCases()
    this.updateSteps()
    this.setStep()
  }

  showSolution () {
    const term = this.exercise.getObject()
    term.proofs = {}
    window.open(
      `logindsolution.html?formula=${encodeURIComponent(JSON.stringify(term))}&exerciseType=${this.exercise.type}&controller=${this.exerciseType}`,
      '_blank',
      'location=no,width=1020,height=600,status=no,toolbar=no'
    )
  }

  completeSolution () {
    window.open(`logindsolution.html?formula=${encodeURIComponent(JSON.stringify(this.exercise.getObject()))}` +
      `&exerciseType=${this.exercise.type}&controller=${this.exerciseType}`,
    '_blank',
    'location=no,width=1020,height=600,status=no,toolbar=no'
    )
  }

  validateStep () {
    if (this.proofDirection === 'begin' || this.proofDirection === 'down') {
      if (!this.validateFormula(document.getElementById('formula-top'), this.exerciseAlert)) {
        return
      }
    }
    if (this.proofDirection === 'begin' || this.proofDirection === 'up') {
      if (!this.validateFormula(document.getElementById('formula-bottom'), this.exerciseAlert)) {
        return
      }
    }

    // Deep copy exercise in case that the step is invalid
    const newExercise = new LogIndExercise(
      this.exercise.getObject(),
      this.exercise.exerciseType,
      {
        titleKey: this.exercise.titleKey,
        titleParams: this.exercise.titleParams
      }
    )

    if (this.proofDirection === 'begin') {
      newExercise.activeCase = new LogIndCase(
        newExercise,
        this.exercise.activeCase.getObject(),
        this.exercise.activeCase.index,
        this.exercise.activeCase.identifier,
        this.exercise.activeCase.type
      )
      // Don't allow a user to restart an existing case
      // if (this.exercise.cases.cases.some(x => x.steps[0].term === document.getElementById('formula-top').value &&
      //     x.steps[x.steps.length - 1].term === document.getElementById('formula-bottom').value)) {
      //   this.updateAlert('shared.error.caseExists', null, 'error')
      //   return
      // }
      let relation = document.getElementById('relation-gap').value
      if (relation === '≤') {
        relation = '<='
      } else if (relation === '≥') {
        relation = '>='
      }
      if (this.exercise.activeCase.type === 'hypothesis') {
        newExercise.activeCase.steps = []
        newExercise.activeCase.insertTopStep()
        newExercise.activeCase.insertTopStep()
        newExercise.activeCase.steps[0].setTerm(document.getElementById('formula-top').value)
        newExercise.activeCase.steps[1].setTerm(document.getElementById('formula-bottom').value)
        newExercise.activeCase.steps[1].rule = 'ih'
        newExercise.activeCase.steps[1].relation = relation
      } else {
        newExercise.activeCase.steps = []
        newExercise.activeCase.insertTopStep()
        newExercise.activeCase.insertBottomStep()
        newExercise.activeCase.steps[0].setTerm(document.getElementById('formula-top').value)
        newExercise.activeCase.steps[1].setTerm(document.getElementById('formula-bottom').value)
        newExercise.activeCase.proofRelation = relation
      }
    }
    if (this.proofDirection === 'down') {
      if (document.getElementById('motivation-top').selectedIndex === 0) {
        this.setErrorLocation('motivation-top')
        this.updateAlert('shared.error.noMotivation', null, 'error')
        return
      }
      let newStep = null
      if (document.getElementById('formula-top').value.replaceAll(' ', '') === newExercise.activeCase.bottomSteps[0].term.replaceAll(' ', '')) {
        // Close proof
        newStep = newExercise.activeCase.bottomSteps[0]
      } else {
        newStep = newExercise.activeCase.insertTopStep()
      }
      newStep.setTerm(document.getElementById('formula-top').value)
      newStep.relation = document.getElementById('relation-top').value
      newStep.rule = document.getElementById('motivation-top').value
    }
    if (this.proofDirection === 'up') {
      if (document.getElementById('motivation-bottom').selectedIndex === 0) {
        this.setErrorLocation('motivation-bottom')
        this.updateAlert('shared.error.noMotivation', null, 'error')
        return
      }
      if (document.getElementById('formula-bottom').value.replaceAll(' ', '') === newExercise.activeCase.topSteps[newExercise.activeCase.topSteps.length - 1].term.replaceAll(' ', '')) {
        // Close proof
        newExercise.activeCase.closeProof(document.getElementById('relation-bottom').value, document.getElementById('motivation-bottom').value)
      } else {
        const newStep = newExercise.activeCase.insertBottomStep()
        const nextStep = newExercise.activeCase.steps[newStep.number + 1]
        newStep.setTerm(document.getElementById('formula-bottom').value)
        nextStep.relation = document.getElementById('relation-bottom').value
        nextStep.rule = document.getElementById('motivation-bottom').value
      }
    }

    this.exerciseValidator.validateExercise(this.exercise, newExercise.getObject(), this.onStepValidated.bind(this), this.onErrorValidatingStep.bind(this))
  }

  // validateFormula () {
  //   const DEFINITIONS = ['max', 'min', 'union', 'set', 'del', 'subst']
  //   if (this.proofDirection === 'begin' || this.proofDirection === 'down') {
  //     try {
  //       let term = document.getElementById('formula-top').value
  //       term = term.replaceAll('∧', '&&')
  //       term = term.replaceAll('∨', '||')
  //       term = term.replaceAll('¬', '~')
  //       term = term.replaceAll('→', '->')
  //       term = term.replaceAll('⋅', '*')

  //       term = term.replaceAll('φ', ' phi ')
  //       term = term.replaceAll('ψ', ' psi ')
  //       term = term.replaceAll('χ', ' chi ')
  //       term = term.replaceAll('∪', ' union ')
  //       term = term.replaceAll('\\', ' del ')
  //       convertM2H(term, this.exercise.definitions.concat(DEFINITIONS))
  //     } catch {
  //       this.setErrorLocation('formula-top')
  //       this.updateAlert('logind.error.syntax', null, 'error')
  //       return false
  //     }
  //   }
  //   if (this.proofDirection === 'begin' || this.proofDirection === 'up') {
  //     try {
  //       let term = document.getElementById('formula-bottom').value
  //       term = term.replaceAll('∧', '&&')
  //       term = term.replaceAll('∨', '||')
  //       term = term.replaceAll('¬', '~')
  //       term = term.replaceAll('→', '->')
  //       term = term.replaceAll('⋅', '*')

  //       term = term.replaceAll('φ', ' phi ')
  //       term = term.replaceAll('ψ', ' psi ')
  //       term = term.replaceAll('χ', ' chi ')
  //       term = term.replaceAll('∪', ' union ')
  //       term = term.replaceAll('\\', ' del ')
  //       convertM2H(term, this.exercise.definitions.concat(DEFINITIONS))
  //     } catch {
  //       this.setErrorLocation('formula-bottom')
  //       this.updateAlert('logind.error.syntax', null, 'error')
  //       return false
  //     }
  //   }
  //   return true
  // }

  newCase (type) {
    this.exercise.activeCase = new LogIndCase(this.exercise)
    this.exercise.activeCase.type = type
    this.setProofDirection('begin')
    this.setStep()
    this.updateSteps()
    this.updateCases()
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
            case 'error':
              if (constraint.message === 'no atom var') {
                this.exercise.baseCasesStatus = 'notStarted'
              } else {
                this.exercise.baseCasesStatus = 'incomplete'
              }
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
            default:
              if (this.exercise.cases.hypotheses.length > 0) {
                this.exercise.hypothesesStatus = 'incomplete'
              } else {
                this.exercise.hypothesesStatus = 'notStarted'
              }
              break
          }
          break
        case 'inductivesteps-finished':
          switch (constraint.value) {
            case 'ok':
              this.exercise.inductiveStepsStatus = 'complete'
              break
            default:
              if (this.exercise.cases.inductiveSteps.length > 0) {
                this.exercise.inductiveStepsStatus = 'incomplete'
              } else {
                this.exercise.inductiveStepsStatus = 'notStarted'
              }
              break
          }
          break
      }
      if (constraint.constraint.startsWith('case-finished')) {
        const identifier = constraint.constraint.split('.')[2]
        const _case = this.exercise.cases.cases.find(x => x.identifier.toLowerCase() === identifier.toLowerCase())
        if (_case !== undefined) {
          switch (constraint.value) {
            case 'ok':
              _case.status = 'complete'
              break
            case 'irrelevant':
              _case.status = 'notStarted'
              break
            default:
              _case.status = 'incomplete'
              break
          }
        }
      }
    }
    if (this.exercise.baseCasesStatus === 'complete' && this.exercise.hypothesesStatus === 'complete' && this.exercise.inductiveStepsStatus === 'complete') {
      this.onCompleted()
    }
  }

  /**
        Handles the error that the step can not be validated
     */
  onErrorValidatingStep (error) {
    this.disableUI(false)
    if (error === undefined) {
      // this.setErrorLocation('new-case')
      this.updateAlert('shared.error.validatingStep', null, 'error')
      return
    }
    let message = error.key
    if (!hasTranslation(message)) {
      message = 'shared.error.wrongStep'
    }
    // this.setErrorLocation('new-case')
    this.updateAlert(message, error.params, 'error')
  }

  /**
        Handles the event that a step is validated

     */
  onStepValidated (term, resultType) {
    switch (resultType) {
      case 'notequiv':
        if (term.includes('invalid instantiation for top expr')) {
          this.setErrorLocation('formula-top')
          this.updateAlert('logind.error.invalidTopExpr', null, 'error')
          break
        }
        if (term.includes('invalid instantiation for bottom expr')) {
          this.setErrorLocation('formula-bottom')
          this.updateAlert('logind.error.invalidBottomExpr', null, 'error')
          break
        }
        if (term.includes('type does not match theorem')) {
          this.setErrorLocation('relation-gap')
          this.updateAlert('logind.error.wrongRelationGap', null, 'error')
          break
        }
        if (term.includes('relation type')) {
          this.setErrorLocation(this.proofDirection === 'up' ? 'relation-bottom' : 'relation-top')
          this.updateAlert('logind.error.wrongRelation', null, 'error')
          break
        }
        if (term.includes('incorrect application ih')) {
          this.setErrorLocation(this.proofDirection === 'up' ? 'formula-bottom' : 'formula-top')
          this.updateAlert('logind.error.incorrectApplicationIh', null, 'error')
          break
        }
        if (term.includes('the induction hypothesis is applicable')) {
          const result = asciiToUnicode(term.split(':')[term.split(':').length - 1], this.exercise.definitions.concat(DEFINITIONS))
          const resultLatex = unicodeToLatex(result, this.exercise.definitions.concat(DEFINITIONS))

          this.setErrorLocation('formula-bottom')
          this.updateAlert('logind.error.wrongResultIh', { result: resultLatex }, 'error')
          break
        }
        if (term.includes('similar-expr')) {
          this.setErrorLocation(this.proofDirection === 'up' ? 'formula-bottom' : 'formula-top')
          this.updateAlert('logind.error.similarExpr', null, 'error')
          break
        }
        if (term.includes('step') && term.includes('check-triple')) {
          this.setErrorLocation(this.proofDirection === 'up' ? 'formula-bottom' : 'formula-top')
          this.updateAlert('logind.error.invalidStep', null, 'error')
          break
        }
        if (term.includes('subproof is not an instance of theorem')) {
          this.setErrorLocation(this.proofDirection === 'up' ? 'formula-bottom' : 'formula-top')
          this.updateAlert('logind.error.invalidSubproof', null, 'error')
          break
        }
        if (term.includes('wrong motivation')) {
          const motivation = this.getMotivationKey(term.split(':')[term.split(':').length - 1])

          this.setErrorLocation(this.proofDirection === 'up' ? 'motivation-bottom' : 'motivation-top')
          this.updateAlert('logind.error.wrongMotivation', { motivation: motivation }, 'error')
          break
        }
        if (term.includes('missing motivation')) {
          const motivation = this.getMotivationKey(term.split(':')[term.split(':').length - 1])

          this.setErrorLocation(this.proofDirection === 'up' ? 'motivation-bottom' : 'motivation-top')
          this.updateAlert('logind.error.missingMotivation', { motivation: motivation }, 'error')
          break
        }
        if (term.includes('miscalculation')) {
          this.setErrorLocation(this.proofDirection === 'up' ? 'formula-bottom' : 'formula-top')
          this.updateAlert('logind.error.miscalculation', null, 'error')
          break
        }
        if (term.includes('different meta vars in hypothesis')) {
          if (term.includes('IHStep')) {
            const metaVar = term.split('"')[1]
            this.setErrorLocation(['formula-bottom', 'formula-top'])
            this.updateAlert('logind.error.differentMetaVarsWith', { metaVar: `\\${metaVar}` }, 'error')
          } else {
            this.setErrorLocation(['formula-bottom', 'formula-top'])
            this.updateAlert('logind.error.differentMetaVars', null, 'error')
          }
          break
        }
        if (term.includes('no meta var in hypothesis')) {
          this.setErrorLocation(['formula-bottom', 'formula-top'])
          this.updateAlert('logind.error.noMetaVar', null, 'error')
          break
        }
        if (term.includes('is applicable, however the result is')) {
          const motivation = this.getMotivationKey(term.split('"')[term.split('"').length - 2])
          const result = asciiToUnicode(term.split(':')[term.split(':').length - 1], this.exercise.definitions.concat(DEFINITIONS))
          const resultLatex = unicodeToLatex(result, this.exercise.definitions.concat(DEFINITIONS))

          this.setErrorLocation(this.proofDirection === 'up' ? 'formula-bottom' : 'formula-top')
          this.updateAlert('logind.error.wrongResult', { result: resultLatex, motivation: motivation }, 'error')
          break
        }
        if (term.includes('connective not in language')) {
          const connective = term.split('"')[1]
          this.setErrorLocation(this.proofDirection === 'up' ? 'formula-bottom' : 'formula-top')
          this.updateAlert('logind.error.noConnective', { connective: connective }, 'error')
          break
        }
        if (term.includes('invalid composed base case')) {
          this.setErrorLocation(['formula-bottom', 'formula-top'])
          this.updateAlert('logind.error.invalidComposedBaseCase', null, 'error')
          break
        }
        if (term.includes('invalid atoms in inductive case')) {
          this.setErrorLocation(['formula-bottom', 'formula-top'])
          this.updateAlert('logind.error.invalidAtomsInInductiveCase', null, 'error')
          break
        }
        if (term.includes('case not recognized')) {
          this.setErrorLocation(['formula-bottom', 'formula-top'])
          this.updateAlert('logind.error.caseNotRecognized', null, 'error')
          break
        }
        if (term.includes('not an instantiation')) {
          this.setErrorLocation(['formula-bottom', 'formula-top'])
          this.updateAlert('logind.error.notInstantiation', null, 'error')
          break
        }
        if (term.includes('different metavars')) {
          this.setErrorLocation(['formula-bottom', 'formula-top'])
          this.updateAlert('logind.error.checkDifferentMetavars', null, 'error')
          break
        }
        if (term.includes('lost metavars')) {
          this.setErrorLocation(['formula-bottom', 'formula-top'])
          this.updateAlert('logind.error.lostMetavars', null, 'error')
          break
        }
        if (term.includes('no induction hypotheses')) {
          this.setErrorLocation(['formula-bottom', 'formula-top'])
          this.updateAlert('logind.error.noInductionHypotheses', null, 'error')
          break
        }
        if (term.includes('not in induction hypothesis')) {
          const metaVar = term.split(':')[term.split(':').length - 1].split(' ')[0]
          this.setErrorLocation(['formula-bottom', 'formula-top'])
          this.updateAlert('logind.error.notInInductionHypotheses', { metaVar: `\\${metaVar}` }, 'error')
          break
        }
        if (term.includes('incorrect IHdefinition: invalid instantiation for top expr in hypothesis')) {
          this.setErrorLocation('formula-top')
          this.updateAlert('logind.error.wrongIHTop', null, 'error')
          break
        }
        if (term.includes('incorrect IHdefinition: invalid instantiation for bottom expr in hypothesis')) {
          this.setErrorLocation('formula-bottom')
          this.updateAlert('logind.error.wrongIHBottom', null, 'error')
          break
        }
        if (term.includes('too many basecases')) {
          this.clearErrors()
          this.updateAlert('logind.error.tooManyBasecases', null, 'error')
          break
        }
        if (term.includes('double case')) {
          const _case = term.split(':')[1].split(' ')[2]
          let caseLatex = null
          switch (_case) {
            case 'NEGATION':
              caseLatex = '\\neg'
              break
            case 'OR':
              caseLatex = '\\lor'
              break
            case 'AND':
              caseLatex = '\\land'
              break
            case 'IMPLIES':
              caseLatex = '\\rightarrow'
              break
          }
          this.setErrorLocation(['formula-bottom', 'formula-top'])
          this.updateAlert('logind.error.doubleCase', { case: caseLatex }, 'error')
          break
        }

        this.updateAlert('logind.error.incorrect', null, 'error')
        break
      case 'detour':
      case 'expected':
      case 'correct':
        this.doNextStep({ formula: term })
        break
    }
    return true
  }

  getMotivationKey (motivation) {
    if (this.baseMotivations.includes(motivation)) {
      return `rule.logic.propositional.logind.${motivation}`
    }
    return {
      key: 'rule.logic.propositional.logind.definition',
      params: { function: motivation }
    }
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
    this.dismissAlert()
    const onSuccess = function (result) {
      this.onCheckConstraints(result)
      if (this.exercise.activeCase !== null && this.exercise.activeCase.status === 'complete') {
        this.onCaseCompleted()
      } else {
        if (this.exercise.activeCase !== null) {
          if (this.proofDirection !== 'up') {
            this.setProofDirection('down')
          }
          document.getElementById('formula-top').value = this.exercise.activeCase.topSteps[this.exercise.activeCase.topSteps.length - 1].term
          document.getElementById('formula-bottom').value = this.exercise.activeCase.bottomSteps[0].term
        }
        this.setStep()
        this.updateSteps()
        this.updateCases()
      }
    }
    this.exerciseValidator.checkConstraints(this.exercise, onSuccess.bind(this), this.onErrorValidatingStep.bind(this))
  }

  onCaseCompleted () {
    this.exercise.activeCase = null
    document.getElementById('formula-top').value = ''
    document.getElementById('formula-bottom').value = ''

    this.setProofDirection('none')
    this.setStep()
    this.updateSteps()
    this.updateCases()
  }

  onCompleted () {
    this.exerciseComplete = true
    document.getElementById('rule-container').style.display = 'none'
    document.getElementById('completed-rule-container').style.display = ''
  }

  // ####################################################################
  // Rendering
  // ####################################################################

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

    if (exerciseCaseDiv.content.querySelector('.delete-case') !== null) {
      exerciseCaseDiv.content.querySelector('.delete-case').addEventListener('click', function () {
        this.deleteCase(_case.index, _case.type)
      }.bind(this))
    }

    if (exerciseCaseDiv.content.querySelector('.edit-case') !== null) {
      exerciseCaseDiv.content.querySelector('.edit-case').addEventListener('click', function () {
        this.editCase(_case.index, _case.type)
      }.bind(this))
    }
    const exerciseCaseTable = document.getElementById('exercise-case-table')
    exerciseCaseTable.appendChild(exerciseCaseDiv.content)
  }

  insertStep (step, isActive) {
    this.dismissAlert()

    const exerciseStep = document.createElement('template')
    exerciseStep.innerHTML = this.renderStep(step, true)

    translateChildren(exerciseStep.content)

    if (exerciseStep.content.querySelector('.delete-step') !== null) {
      exerciseStep.content.querySelector('.delete-step').addEventListener('click', function () {
        this.deleteStep(step.number)
      }.bind(this))
    }

    const exerciseStepTable = document.getElementById('exercise-step-table')
    if (step.isTopStep) {
      exerciseStepTable.insertBefore(exerciseStep.content, document.getElementById('active-step-top'))
    } else {
      exerciseStepTable.appendChild(exerciseStep.content)
    }
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
    let message = null
    let messageParams = null
    if (this.exercise.activeCase !== null && _case.identifier === this.exercise.activeCase.identifier) {
      border = 'active'
      status = 'active'
    } else {
      status = _case.status
    }
    if (_case.type === 'hypothesis') {
      message = 'hypothesis'
      messageParams = JSON.stringify({ title: _case.getFormattedIdentifier() })
    }

    const exerciseStepHtml = stepTemplate.render({
      titleParams: JSON.stringify({ title: _case.getFormattedIdentifier() }),
      border: border,
      exerciseComplete: this.exerciseComplete,
      message: message,
      messageParams: messageParams,
      type: _case.type,
      status: status,
      steps: newSteps
    })

    return exerciseStepHtml
  }

  renderActiveHeader () {
    const stepTemplate = $.templates('#exercise-active-case-header-template')

    const exerciseStepHtml = stepTemplate.render({
      proof: this.exercise.activeCase.getProof()
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

  renderCaseBuffer (_case) {
    const stepTemplate = $.templates('#exercise-case-step-buffer-template')
    let border = null
    if (this.exercise.activeCase !== null && _case.identifier === this.exercise.activeCase.identifier) {
      border = 'active'
    }

    const exerciseStepBufferHtml = stepTemplate.render({
      border: border
    })

    return exerciseStepBufferHtml
  }

  renderStep (step, isActive) {
    const stepTemplate = $.templates(isActive ? (step.isTopStep ? '#exercise-active-top-step-template' : '#exercise-active-bottom-step-template') : '#exercise-case-step-template')
    let border = null

    if (this.exercise.activeCase !== null && step.case.identifier === this.exercise.activeCase.identifier) {
      border = 'active'
    }

    let motivation = step.rule
    let motivationParams = {}
    if (step.rule !== null && ![].concat(this.baseMotivations).concat(this.exercise.motivations).includes(step.rule)) {
      motivationParams = { function: motivation }
      motivation = 'definition'
    }

    const exerciseStepHtml = stepTemplate.render({
      border: border,
      highlightRelation: step.highlightRelation,
      highlightTerm: step.highlightTerm,
      highlightRule: step.highlightRule,
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

  // ####################################################################
  // Cases
  // ####################################################################

  deleteCase (index, type) {
    // Deep copy exercise in case that the step is invalid
    const newExercise = new LogIndExercise(
      this.exercise.getObject(),
      this.exercise.exerciseType,
      {
        titleKey: this.exercise.titleKey,
        titleParams: this.exercise.titleParams
      }
    )
    newExercise.deleteCase(index, type)
    const onSuccessDiagnose = function (result, resultType) {
      const onSuccess = function (result) {
        this.onCheckConstraints(result)
        this.updateCases()
      }
      switch (resultType) {
        case 'notequiv':
          this.updateAlert('logind.error.incorrect', null, 'error')
          break
        case 'detour':
        case 'expected':
        case 'correct':
          this.exercise.deleteCase(index, type)
          this.exerciseValidator.checkConstraints(this.exercise, onSuccess.bind(this), this.onErrorValidatingStep.bind(this))
          break
      }
    }
    const onErrorDiagnose = function (result) {
      this.updateAlert('logind.error.incorrect', null, 'error')
    }
    this.exerciseValidator.validateExercise(this.exercise, newExercise.getObject(), onSuccessDiagnose.bind(this), onErrorDiagnose.bind(this))
  }

  editCase (index, type) {
    this.exercise.activeCase = this.exercise.getCase(index, type)

    this.setProofDirection('down')
    this.updateCases()
    this.updateSteps()
    this.setStep()
  }

  deleteStep (index) {
    this.exercise.activeCase.deleteStep(index)
    const onSuccess = function (result) {
      this.onCheckConstraints(result)
      this.updateCases()
      this.updateSteps()
      this.setStep()
    }
    this.exerciseValidator.checkConstraints(this.exercise, onSuccess.bind(this), this.onErrorValidatingStep.bind(this))
  }

  // ####################################################################
  // Interface formatting
  // ####################################################################

  setProofDirection (direction) {
    this.proofDirection = direction
    const validateStep = document.getElementById('validate-step')
    const steps = document.getElementById('exercise-step-table')
    const topStep = document.getElementById('active-step-top')
    const topFormula = document.getElementById('active-formula-top')
    const bottomStep = document.getElementById('active-step-bottom')
    const bottomFormula = document.getElementById('active-formula-bottom')
    const relationGap = document.getElementById('relation-gap')
    const directionButton = document.getElementById('change-direction')
    const activeMessage = document.getElementById('active-message')
    const stepBuffer = document.getElementById('step-buffer')

    if (direction === 'down') {
      validateStep.style.display = ''
      steps.style.display = ''
      activeMessage.style.display = ''
      topStep.style.display = ''
      topFormula.style.display = ''
      bottomStep.style.display = 'none'
      bottomFormula.style.display = 'none'
      relationGap.style.display = 'none'
      directionButton.style.display = ''
      stepBuffer.style.display = ''
    }
    if (direction === 'up') {
      validateStep.style.display = ''
      steps.style.display = ''
      activeMessage.style.display = ''
      topStep.style.display = 'none'
      topFormula.style.display = 'none'
      bottomStep.style.display = ''
      bottomFormula.style.display = ''
      relationGap.style.display = 'none'
      directionButton.style.display = ''
      stepBuffer.style.display = ''
    }
    if (direction === 'none') {
      validateStep.style.display = 'none'
      steps.style.display = 'none'
      activeMessage.style.display = 'none'
      topStep.style.display = 'none'
      topFormula.style.display = 'none'
      bottomStep.style.display = 'none'
      bottomFormula.style.display = 'none'
      relationGap.style.display = 'none'
      directionButton.style.display = 'none'
      stepBuffer.style.display = 'none'
    }
    if (direction === 'begin') {
      validateStep.style.display = ''
      steps.style.display = ''
      activeMessage.style.display = ''
      topStep.style.display = 'none'
      topFormula.style.display = ''
      bottomStep.style.display = 'none'
      bottomFormula.style.display = ''
      directionButton.style.display = 'none'
      relationGap.style.display = ''
      stepBuffer.style.display = ''
    }
    this.setStep()
  }

  setStep () {
    if (this.exercise.activeCase === null) {
      return
    }
    if (this.exercise.activeCase.steps.length >= 2) {
      document.getElementById('formula-top').value = this.exercise.activeCase.topSteps[this.exercise.activeCase.topSteps.length - 1].term
      document.getElementById('formula-bottom').value = this.exercise.activeCase.bottomSteps[0].term
    } else {
      document.getElementById('formula-top').value = ''
      document.getElementById('formula-bottom').value = ''
    }
    if (this.exercise.activeCase.topSteps.length === 0) {
      document.getElementById('relation-top').style.display = 'none'
      document.getElementById('motivation-top').style.display = 'none'
      translateElementPlaceholder(document.getElementById('formula-top'), 'logind.step.placeholder.left')
    } else {
      document.getElementById('relation-top').style.display = ''
      document.getElementById('motivation-top').style.display = ''
      translateElementPlaceholder(document.getElementById('formula-top'), 'logind.step.placeholder.middle')
    }
    if (this.exercise.activeCase.bottomSteps.length === 0) {
      document.getElementById('relation-bottom').style.display = ''
      document.getElementById('motivation-bottom').style.display = 'none'
      translateElementPlaceholder(document.getElementById('formula-bottom'), 'logind.step.placeholder.right')
    } else {
      document.getElementById('relation-bottom').style.display = ''
      document.getElementById('motivation-bottom').style.display = ''
      translateElementPlaceholder(document.getElementById('formula-bottom'), 'logind.step.placeholder.middle')
    }
  }

  updateSteps () {
    this.clearErrors() // verwijder alle voorgaande foutmeldingen van het scherm
    const steps = document.querySelectorAll('.case-step-row')
    const exerciseStepTable = document.getElementById('exercise-step-table')
    for (const step of steps) {
      exerciseStepTable.removeChild(step)
    }

    if (this.exercise.activeCase === null) {
      return
    }

    if (this.exercise.activeCase.getProof() === null) {
      translateElement(document.getElementById('active-message-text'), `logind.step.message.begin.${this.exercise.activeCase.type}`)
    } else {
      translateElement(document.getElementById('active-message-text'), 'logind.step.message.prove', {
        formula: this.exercise.activeCase.getProof()
      })
    }

    for (const step of this.exercise.activeCase.steps) {
      this.insertStep(step)
    }

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
    if (this.exercise.baseCasesStatus === 'complete' && this.exercise.cases.hypotheses.length === 0) {
      this.insertCaseMessage('no_hypotheses')
    }

    this.insertCaseHeader('inductiveSteps', this.exercise.inductiveStepsStatus)
    for (const _case of this.exercise.cases.inductiveSteps) {
      this.insertCase(_case)
    }
    if (this.exercise.hypothesesStatus === 'complete' && this.exercise.cases.inductiveSteps.length === 0) {
      this.insertCaseMessage('no_inductive_steps')
    }

    this.disableUI(false)
  }
}
