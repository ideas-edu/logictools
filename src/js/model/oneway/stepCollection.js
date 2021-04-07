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
}
