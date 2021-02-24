import { OneWayStep } from './step.js'
import { OneWayStepCollection } from './stepCollection.js'
/**
    Represents a one way exercise.
    @constructor
    @param {string} formulaText - The text of the formula.
    @param {string} exerciseType - The type of the formula. ("DNV","CNV",...)
    @property {OneWayStepCollection} steps The collection of oneway steps.
 */
export class OneWayExercise {
  constructor (formulaText, exerciseType, ruleJustification, stepValidation) {
    this.type = exerciseType
    this.usesRuleJustification = ruleJustification
    this.usesStepValidation = stepValidation
    this.isReady = false
    this.formula = formulaText
    this.steps = new OneWayStepCollection(new OneWayStep(formulaText))
  }

  /**
        Gets the current/Last step of the exercise
        @return {OneWayStep} - The current/last step of the exercise
    */
  getCurrentStep () {
    return this.steps.getCurrentStep()
  }

  /**
        Gets the previous step of the exercise (last but one)
        @return {OneWayStep} - The previous step of the exercise (last but one)
    */
  getPreviousStep () {
    return this.steps.getPreviousStep()
  }
}
