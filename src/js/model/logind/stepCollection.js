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
        if (['p', 'q', 'r', 's'].includes(identifier)) {
          this.baseCases.push(new LogIndCase(this.exercise, _case, i, identifier, 'baseCase'))
          i++
        } else if (['psi', 'phi', 'chi'].includes(identifier)) {
          this.hypotheses.push(new LogIndCase(this.exercise, _case, j, identifier, 'hypothesis'))
          j++
        } else {
          this.inductiveSteps.push(new LogIndCase(this.exercise, _case, k, identifier, 'inductiveStep'))
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
  constructor (exercise, _case, index, identifier, type) {
    super()
    this.exercise = exercise
    this.index = index
    this.identifier = identifier
    this.type = type
    this.steps = []
    this.proofRelation = null
    if (identifier === undefined) {
      this.identifier = ''
    }

    if (_case === undefined) {
      _case = {}
      return
    }

    let rule = null
    let relation = null
    let number = 0
    let isTopStep = true
    let currentStep = null
    for (const step of _case) {
      if (isTopStep) {
        if (step.constructor === String) {
          this.steps.push(new LogIndStep(this, step, rule, relation, number, isTopStep))
        } else {
          rule = step.motivation
          relation = step.type
          if (rule === '<GAP>') {
            this.proofRelation = relation
            relation = null
            rule = null
            isTopStep = false
          }
          number += 1
        }
      } else {
        // Bottom step
        if (step.constructor === String) {
          currentStep = step
          this.steps.push(new LogIndStep(this, currentStep, rule, relation, number, isTopStep))
        } else {
          rule = step.motivation
          relation = step.type
          number += 1
          currentStep = null
        }
      }
    }
    // if (!isTopStep && currentStep !== null) {
    //   this.steps.push(new LogIndStep(this, currentStep, null, null, number, isTopStep))
    // }

    // this.stepsHistory = [JSON.parse(JSON.stringify(this.steps))]
    // this.stepsHistoryIndex = 0
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

  get topSteps () {
    return this.steps.filter(x => x.isTopStep)
  }

  get bottomSteps () {
    return this.steps.filter(x => !x.isTopStep)
  }

  insertTopStep () {
    const index = this.topSteps.length
    const newStep = new LogIndStep(this, '', null, index === 0 ? null : null, index, true)
    this.steps.splice(index, 0, newStep)
    return newStep
  }

  insertBottomStep () {
    for (const bottomStep of this.bottomSteps) {
      bottomStep.number += 1
    }
    const index = this.steps.length - this.bottomSteps.length
    const newStep = new LogIndStep(this, '', null, this.bottomSteps.length === 0 ? null : null, index, false)
    this.steps.splice(index, 0, newStep)
    return newStep
  }

  closeProof (relation, rule) {
    const bs = [].concat(this.bottomSteps)
    for (let index = this.bottomSteps.length - 1; index > 0; index--) {
      bs[index].isTopStep = true
      bs[index].rule = this.bottomSteps[index - 1].rule
      bs[index].relation = this.bottomSteps[index - 1].relation
    }

    bs[0].isTopStep = true
    bs[0].rule = rule
    bs[0].relation = relation
  }

  deleteStep (index) {
    for (let i = index + 1; i < this.steps.length; i++) {
      this.steps[i].number -= 1
    }
    this.steps.splice(index, 1)
  }
}
