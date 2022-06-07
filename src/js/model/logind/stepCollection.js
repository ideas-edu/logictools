import { StepCollection } from '../shared/stepCollection.js'
import { LogIndStep } from './step.js'
/**
    LogIndStepCollection is an ordered list of conversion steps.
    @constructor
    @param {ProofStep} baseStep - The first proof step.
 */
export class LogIndCaseCollection {
  constructor (exercise, cases) {
    this.exercise = exercise
    this.baseCases = []
    this.hypotheses = []
    this.inductiveSteps = []
    if (cases !== null && cases !== undefined) {
      let i = 0
      let j = 0
      let k = 0
      for (const [identifier, _case] of Object.entries(cases)) {
        if (['basestep', 'p', 'q', 'r', 's'].includes(identifier)) {
          this.baseCases.push(new LogIndCase(this.exercise, 'baseCase', _case, i, identifier))
          i++
        } else if (['ihstep', 'psi', 'phi', 'chi'].includes(identifier)) {
          this.hypotheses.push(new LogIndCase(this.exercise, 'hypothesis', _case, j, identifier))
          j++
        } else {
          this.inductiveSteps.push(new LogIndCase(this.exercise, 'inductiveStep', _case, k, identifier))
          k++
        }
      }
    }
    // this.casesHistory = [JSON.parse(JSON.stringify(this.cases))]
    // this.casesHistoryIndex = 0
  }

  get cases () {
    return this.baseCases.concat(this.hypotheses.concat(this.inductiveSteps))
  }

  getObject () {
    const object = {}
    for (const _case of this.cases) {
      object[_case.identifier] = _case.getObject()
    }
    return object
  }
}

const IDENTIFIERS = {
  p: 'p',
  q: 'q',
  r: 'r',
  phi: '\\phi',
  psi: '\\psi',
  chi: '\\chi',
  NEGATION: '\\neg',
  OR: '\\lor',
  AND: '\\land',
  IMPLIES: '\\rightarrow'
}

export class LogIndCase extends StepCollection {
  constructor (exercise, type, _case, index, identifier) {
    super()
    this.Step = LogIndStep
    this.index = index
    this.identifier = identifier
    this.type = type
    this.proofRelation = exercise.theorem[1].type
    this.isCollapsed = false
    if (identifier === undefined) {
      switch (type) {
        case 'baseCase':
          this.identifier = 'basestep'
          break
        case 'hypothesis':
          this.identifier = 'ihstep'
          break
        case 'inductiveStep':
          this.identifier = 'inductivestep'
          break
        default:
          this.identifier = ''
      }
    }
    this.setSteps(exercise, _case)
  }

  getObject () {
    const object = []
    for (const step of this.steps) {
      const intermediate = {
        motivation: step.rule === null ? '<GAP>' : step.rule,
        type: step.rule === null ? this.proofRelation : step.getAsciiRelation()
      }
      if (step.isTopStep) {
        if (step.rule !== null) {
          object.push(intermediate)
        }
        object.push(step.unicodeToAscii(step.term))
      } else {
        object.push(intermediate)
        object.push(step.unicodeToAscii(step.term))
      }
    }

    return object
  }

  getProof () {
    if (this.steps.length < 2) {
      return null
    }
    const leftExpression = this.steps[0].unicodeToLatex(this.steps[0].term)
    const rightExpression = this.steps[this.steps.length - 1].unicodeToLatex(this.steps[this.steps.length - 1].term)
    let relation = this.proofRelation
    if (this.proofRelation === '<=') {
      relation = '\\leq'
    } else if (this.proofRelation === '>=') {
      relation = '\\geq'
    }
    const proofKatex = `${leftExpression}${relation}${rightExpression}`
    return proofKatex
  }

  getFormattedIdentifier () {
    return IDENTIFIERS[this.identifier]
  }

  deleteStep (index) {
    if (this.steps[index].isTopStep) {
      this.steps = this.steps.filter(step => !(step.number >= index && step.isTopStep))
    } else {
      this.steps[index + 1].relation = null
      this.steps[index + 1].rule = null
      this.steps = this.steps.filter(step => !(step.number <= index && !step.isTopStep))
    }
    for (let i = 0; i < this.steps.length; i++) {
      this.steps[i].number = i
    }
  }
}
