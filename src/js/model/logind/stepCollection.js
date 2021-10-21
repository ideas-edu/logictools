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

    if (_case === undefined) {
      _case = ['', {
        motivation: '?',
        type: '='
      }, '']
    }
    this.steps = []
    let rule = null
    let relation = null
    let number = 0
    for (const step of _case) {
      if (step.constructor === String) {
        this.steps.push(new LogIndStep(this.exercise, step, rule, relation, number))
      } else {
        rule = step.motivation
        relation = step.type
        number += 1
      }
    }

    // this.stepsHistory = [JSON.parse(JSON.stringify(this.steps))]
    // this.stepsHistoryIndex = 0
  }

  getObject () {
    const object = []
    for (const step of this.steps) {
      if (step.rule !== null) {
        object.push({
          motivation: step.rule,
          type: step.relation
        })
      }
      object.push(step.unicodeToAscii(step.term))
    }

    return object
  }

  getFormattedIdentifier () {
    return IDENTIFIERS[this.identifier]
  }

  insertStepAbove (index) {
    for (let i = index; i < this.steps.length; i++) {
      this.steps[i].number += 1
    }
    if (index === 0) {
      this.steps[0].rule = '?'
      this.steps[0].relation = '='
      this.steps.splice(index, 0, new LogIndStep(this.exercise, '', null, null, index))
    } else {
      this.steps.splice(index, 0, new LogIndStep(this.exercise, '', '?', '=', index))
    }
  }

  insertStepBelow (index) {
    for (let i = index + 1; i < this.steps.length; i++) {
      this.steps[i].number += 1
    }
    this.steps.splice(index + 1, 0, new LogIndStep(this.exercise, '', '?', '=', index + 1))
  }

  deleteStep (index) {
    for (let i = index + 1; i < this.steps.length; i++) {
      this.steps[i].number -= 1
    }
    this.steps.splice(index, 1)
    if (index === 0) {
      this.steps[0].rule = null
      this.steps[0].relation = null
    }
  }
}
