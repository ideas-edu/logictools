import { StepCollection } from '../shared/stepCollection.js'
import { TwoWayStep } from './step.js'
import { Rules } from '../rules.js'

/**
    TwoWayStepCollection is an ordered list of proof steps.
    @constructor
    @param {ProofStep} baseStep - The first proof step.
 */
export class TwoWayStepCollection extends StepCollection {
  constructor (exercise, steps) {
    super()
    this.Step = TwoWayStep
    this.setSteps(exercise, steps)
  }

  getObject () {
    const object = []
    for (const step of this.steps) {
      const intermediate = {
        motivation: step.rule === null ? '<GAP>' : step.rule,
        type: '<=>'
      }
      if (step.isTopStep) {
        if (step.rule !== null) {
          object.push(intermediate)
        }
        object.push(step.formula)
      } else {
        object.push(intermediate)
        object.push(step.formula)
      }
    }

    return object
  }

  getCurrentTopStep () {
    return this.topSteps[this.topSteps.length - 1]
  }

  getCurrentBottomStep () {
    return this.bottomSteps[0]
  }

  isComplete () {
    return this.bottomSteps.length === 0
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
    this.steps = this.steps.filter(x => !x.isTopStep || x.number < index)
  }

  removeBottomSteps (index) {
    this.steps[index+1].rule = null
    this.steps = this.steps.filter(x => x.isTopStep || x.number > index)
    for (const [index, step] of this.steps.entries()) {
      step.number = index
    }
  }
}
