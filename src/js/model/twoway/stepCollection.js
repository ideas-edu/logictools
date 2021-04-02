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
    this.bottomSteps = [new TwoWayStep(equation.formula2, undefined, 'bottom')]
  }

    /**
        Gets the current step.
        @return {OneWayStep} The current step.
     */
  getCurrentStep () {
    return this.topSteps[this.topSteps.length - 1]
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
    this.topSteps.push(step)
  }

  pushBottomStep (step) {
    this.bottomSteps.push(step)
  }

  /**
        Removes the bottom steps starting from the specified index.
        @param {Number} index - The start index.
     */
  removeBottomSteps (index) {
    const filteredSteps = []
    let formula = this.steps[0].equation.formula2 // voor reset van de top steps naar de nieuwe bottomstep
    let stepCount = 0
    let i

    for (i = 0; i < this.steps.length; i += 1) {
      if (this.steps[i].isBottomStep) {
        if (stepCount < index) {
          formula = this.steps[i].equation.formula2
        } else {
          continue
        }
        stepCount += 1
      } else {
        if (stepCount >= index) {
          this.steps[i].equation.formula2 = formula // reset de top steps naar de nieuwe bottomstep
        }
      }
      filteredSteps.push(this.steps[i])
    }

    this.steps = filteredSteps
  }

  /**
        Removes the top steps starting from the specified index.
        @param {Number} index - The start index.
     */
  removeTopSteps (index) {
    const filteredSteps = []
    let formula = this.steps[0].equation.formula1 // voor reset van de bottom steps naar de nieuwe topstep
    let stepCount = 0
    let i
    for (i = 0; i < this.steps.length; i += 1) {
      if (this.steps[i].isTopStep) {
        if (stepCount < index) {
          formula = this.steps[i].equation.formula1
        } else {
          continue
        }
        stepCount += 1
      } else {
        if (stepCount >= index) {
          this.steps[i].equation.formula1 = formula // reset de bottom steps naar de nieuwe topstep
        }
      }
      filteredSteps.push(this.steps[i])
    }
    this.steps = filteredSteps
  }
}
