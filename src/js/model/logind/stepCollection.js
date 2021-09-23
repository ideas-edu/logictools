import { StepCollection } from '../shared/stepCollection.js'
import { LogIndStep } from './step.js'
/**
    LogIndStepCollection is an ordered list of conversion steps.
    @constructor
    @param {ProofStep} baseStep - The first proof step.
 */
export class LogIndCaseCollection {
  constructor (cases) {
    this.cases = []
    if (cases !== null && cases !== undefined) {
      for (const [identifier, _case] of Object.entries(cases)) {
        this.cases.push(_case)
      }
    }
    this.casesHistory = [JSON.parse(JSON.stringify(this.cases))]
    this.casesHistoryIndex = 0
  }
}

export class LogIndCase extends StepCollection {
  // [
  //   "prop (phi&&psi)",
  //   {
  //       "motivation": "prop",
  //       "type": "="
  //   },
  //   "prop phi+prop psi",
  //   {
  //       "motivation": "ih",
  //       "type": "="
  //   },
  //   "bin phi+1+prop psi",
  //   {
  //       "motivation": "ih",
  //       "type": "="
  //   },
  //   "bin phi+1+bin psi+1",
  //   {
  //       "motivation": "bin",
  //       "type": "="
  //   },
  //   "bin (phi&&psi)+1"
  // ]
  constructor (_case) {
    super()

    if (_case === undefined) {
      _case = ['']
    }
    this.steps = []
    let rule = null
    let relation = null
    let number = 0
    for (const step of _case) {
      if (step.constructor === String) {
        this.steps.push(new LogIndStep(step, rule, relation, number))
      } else {
        rule = step.motivation
        relation = step.type
        number += 1
      }
    }

    this.stepsHistory = [JSON.parse(JSON.stringify(this.steps))]
    this.stepsHistoryIndex = 0
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
      object.push(step.term)
    }

    return object
  }

  insertStepAbove (index) {
    for (let i = index; i < this.steps.length; i++) {
      this.steps[i].number += 1
    }
    if (index === 0) {
      this.steps[0].rule = '?'
      this.steps[0].relation = '='
      this.steps.splice(index, 0, new LogIndStep('', null, null, index))
    } else {
      this.steps.splice(index, 0, new LogIndStep('', '?', '=', index))
    }
  }

  insertStepBelow (index) {
    for (let i = index + 1; i < this.steps.length; i++) {
      this.steps[i].number += 1
    }
    this.steps.splice(index + 1, 0, new LogIndStep('', '?', '=', index + 1))
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
