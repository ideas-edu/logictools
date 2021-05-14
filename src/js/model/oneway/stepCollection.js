import { Rules } from '../rules.js'
import { StepCollection } from '../shared/stepCollection.js'

/**
    OneWayStepCollection is an ordered list of conversion steps.
    @constructor
    @param {ProofStep} baseStep - The first proof step.
 */
export class OneWayStepCollection extends StepCollection {
  constructor (baseStep) {
    super()
    this.steps = []
    if (baseStep !== null) {
      this.push(baseStep)
    }
  }

  /**
        Adds a one way step to the collection.
        @param {OneWayStep} onewayStep - The oneway step.
     */
  push (step) {
    // deze stappen filteren we eruit omdat dit geen stappen zijn die een normale gebruiker zou doen
    if (Rules[step.rule] === null) {
      return
    }
    step.number = this.steps.length + 1
    this.steps.push(step)
  }
}
