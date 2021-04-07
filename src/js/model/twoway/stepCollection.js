import { StepCollection } from '../shared/stepCollection.js'
import { TwoWayStep } from './step.js'
import { Rules } from '../rules.js'

/**
    TwoWayStepCollection is an ordered list of proof steps.
    @constructor
    @param {ProofStep} baseStep - The first proof step.
 */
export class TwoWayStepCollection extends StepCollection {
  constructor (equation) {
    super()
    this.topSteps = [new TwoWayStep(equation.formula1, undefined, 'top')]
    this.topSteps[0].number = 1
    this.bottomSteps = [new TwoWayStep(equation.formula2, undefined, 'bottom')]
    this.bottomSteps[0].number = 1
  }

  /**
    Gets the current step.
        @return {OneWayStep} The current step.
     */
  getCurrentStep () {
    return this.topSteps[this.topSteps.length - 1]
  }

  getCurrentTopStep () {
    return this.topSteps[this.topSteps.length - 1]
  }

  getCurrentBottomStep () {
    return this.bottomSteps[this.bottomSteps.length - 1]
  }

  /**
    Gets all the top step.
        @return {ProofStep[]} The top steps.
    */
  getTopSteps () {
    return this.topSteps
  }

  /**
        Gets all the bottom step.
        @return {ProofStep[]} The bottom steps.
    */
  getBottomSteps () {
    return this.bottomSteps
  }

  isComplete () {
    return this.topSteps[this.topSteps.length - 1].formula === this.bottomSteps[this.bottomSteps.length - 1].formula
  }

  /**
        Adds a proof step to the collection.
        @param {ProofStep} proofStep - The proof step.
     */
  push (proofStep) {
    // deze stappen filteren we eruit omdat dit geen stappen zijn die een normale gebruiker zou doen
    if (Rules[proofStep.rule] === null) {
      return
    }

    if (this.steps[this.steps.length - 1] !== null) {
      proofStep.isTopStep = proofStep.equation.formula1 !== this.steps[this.steps.length - 1].equation.formula1
      proofStep.isBottomStep = proofStep.equation.formula2 !== this.steps[this.steps.length - 1].equation.formula2
    }

    this.steps.push(proofStep)
  }

  pushTopStep (step) {
    step.number = this.topSteps.length + 1
    this.topSteps.push(step)
  }

  pushBottomStep (step) {
    step.number = this.bottomSteps.length + 1
    this.bottomSteps.push(step)
  }

  /**
        Removes the top steps starting from the specified index.
        @param {Number} index - The start index.
     */
  removeTopSteps (index) {
    this.topSteps = this.topSteps.slice(0, index)
  }

  removeBottomSteps (index) {
    this.bottomSteps = this.bottomSteps.slice(0, index)
  }
}
