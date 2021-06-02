import { StepCollection } from '../shared/stepCollection.js'

/**
    LogAxStepCollection is an ordered list of conversion steps.
    @constructor
    @param {ProofStep} baseStep - The first proof step.
 */
export class LogAxStepCollection extends StepCollection {
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
    this.steps.push(step)
    this.steps.sort((a, b) => a.number > b.number)
  }
}
