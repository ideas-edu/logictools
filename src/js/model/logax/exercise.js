import { LogAxStepCollection } from './stepCollection.js'
/**
    Represents a one way exercise.
    @constructor
    @param {string} formulaText - The text of the formula.
    @param {string} exerciseType - The type of the formula. ("DNV","CNV",...)
    @property {LogAxStepCollection} steps The collection of LogAx steps.
 */
export class LogAxExercise {
  constructor (term, exerciseType, properties) {
    this.type = exerciseType
    this.titleKey = properties.titleKey
    this.titleParams = properties.titleParams
    this.prefix = '[]'
    this.steps = new LogAxStepCollection(term.proof)
    this.lemmas = term.lemmas === undefined ? [] : term.lemmas

    const lastStep = this.steps.steps[this.steps.steps.length - 1]
    this.theorem = lastStep.term
    this.theoremKatex = lastStep.termKatex
  }

  getObject () {
    const object = {
      proof: this.steps.getObject(),
      lemmas: this.lemmas
    }
    return object
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
