import { Rules } from '../rules.js'

/**
    StepCollection is an bastract class for ordered lists of conversion steps.
    @constructor
    @param {ProofStep} baseStep - The first proof step.
 */
export class StepCollection {
  constructor (baseStep) {
    this.steps = []
    if (baseStep !== null) {
      this.push(baseStep)
    }
  }

  /**
        Gets the current step.
        @return {OneWayStep} The current step.
     */
  getCurrentStep () {
    return this.steps[this.steps.length - 1]
  }

  /**
        Gets the previous step.
        @return {ProofStep} The previous step.
     */
  getPreviousStep () {
    if (this.steps.length === 1) {
      return this.baseStep
    }
    return this.steps[this.steps.length - 2]
  }

  /**
        Gets all the steps.
        @return {OneWayStep[]} The steps.
     */
  getSteps () {
    return this.steps
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

  /**
        Removes the latest oneway step from the collection.
     */
  pop () {
    this.steps.pop()
  }

  /**
        Removes the top steps starting from the specified index.
        @param {Number} index - The start index.
     */
  removeTopSteps (index) {
    this.steps = this.steps.slice(0, index)
  }
}
