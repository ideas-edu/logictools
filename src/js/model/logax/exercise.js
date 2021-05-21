import { LogAxStep } from './step.js'
import { LogAxStepCollection } from './stepCollection.js'
/**
    Represents a one way exercise.
    @constructor
    @param {string} formulaText - The text of the formula.
    @param {string} exerciseType - The type of the formula. ("DNV","CNV",...)
    @property {LogAxStepCollection} steps The collection of LogAx steps.
 */
export class LogAxExercise {
  constructor (steps, exerciseType, properties) {
    this.type = exerciseType
    this.titleKey = properties.titleKey
    this.titleParams = properties.titleParams
    const initialStep = new LogAxStep(steps[0])
    this.steps = new LogAxStepCollection(initialStep)
    this.theorem = initialStep.term
    this.theoremKatex = initialStep.termKatex
  }

  /**
        Gets the current/Last step of the exercise
        @return {LogAxStep} - The current/last step of the exercise
    */
  getCurrentStep () {
    return this.steps.getCurrentStep()
  }

  /**
        Gets the previous step of the exercise (last but one)
        @return {LogAxStep} - The previous step of the exercise (last but one)
    */
  getPreviousStep () {
    return this.steps.getPreviousStep()
  }
}
