import { Equation } from './equation.js'
import { TwoWayStepCollection } from './stepCollection.js'

/**
    Represents a two way exercise.
    @constructor
    @param {string} equationText - The text of the equation.
    @property {Equation} equation The equation.
    @property {ProofStepCollection} steps The collection of proof steps.
 */
export class TwoWayExercise {
  constructor (equationText, exerciseType, properties) {
    this.type = exerciseType
    this.usesStepValidation = properties.stepValidation
    this.titleKey = properties.titleKey
    this.titleParams = properties.titleParams
    this.isReady = false
    this.equation = new Equation(equationText)
    this.steps = new TwoWayStepCollection(this.equation)
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
