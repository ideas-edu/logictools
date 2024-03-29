import { TwoWayStepCollection } from './stepCollection.js'

/**
    Represents a two way exercise.
 */
export class TwoWayExercise {
  constructor (steps, exerciseType, properties) {
    this.type = exerciseType
    this.prefix = '[]'
    this.usesStepValidation = properties.stepValidation
    this.titleKey = properties.titleKey
    this.titleParams = properties.titleParams
    this.isReady = false
    this.steps = new TwoWayStepCollection(this, steps)
  }

  /**
        Gets the current step.
        @return {ProofStep} - The current step.
    */
  getCurrentStep () {
    return this.steps.getCurrentStep()
  }

  /**
        Gets the previous step.
        @return {ProofStep} - The previous step.
    */
  getPreviousStep () {
    return this.steps.getPreviousStep()
  }
}
