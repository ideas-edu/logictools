import { StepCollection } from '../shared/stepCollection.js'
import { LogAxStep } from './step.js'
/**
    LogAxStepCollection is an ordered list of conversion steps.
    @constructor
    @param {ProofStep} baseStep - The first proof step.
 */
export class LogAxStepCollection extends StepCollection {
  constructor (baseStep) {
    super()
    this.steps = []
    if (baseStep !== null && baseStep !== undefined) {
      this.push(baseStep)
    }
    this.stepsHistory = [JSON.parse(JSON.stringify(this.steps))]
    this.stepsHistoryIndex = 0
  }

  /**
        Adds a one way step to the collection.
        @param {OneWayStep} onewayStep - The oneway step.
     */
  push (step) {
    this.steps.push(step)
    this.steps.sort((a, b) => a.number > b.number)
  }

  newSet (steps) {
    this.steps = []
    for (const responseStep of steps) {
      const newStep = new LogAxStep(responseStep)
      this.steps.push(newStep)
      // highlight differences
      let found = false
      for (const oldStep of this.stepsHistory[this.stepsHistoryIndex]) {
        if (newStep.number === oldStep.number) {
          if (newStep.rule !== oldStep.rule) {
            newStep.highlightRule = true
          }
          if (newStep.term !== oldStep.term) {
            newStep.highlightTerm = true
          }
          found = true
          break
        }
      }
      if (!found) {
        newStep.highlightStep = true
        newStep.highlightRule = true
        newStep.highlightTerm = true
      }
    }
    this.stepsHistory.push(JSON.parse(JSON.stringify(this.steps)))
    this.stepsHistoryIndex += 1
  }
}
