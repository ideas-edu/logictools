import { LogIndCaseCollection, LogIndCase } from './stepCollection.js'
/**
    Represents a one way exercise.
    @constructor
    @param {string} formulaText - The text of the formula.
    @param {string} exerciseType - The type of the formula. ("DNV","CNV",...)
    @property {LogIndStepCollection} steps The collection of LogInd steps.
 */
export class LogIndExercise {
  constructor (term, exerciseType, properties) {
    this.type = exerciseType
    this.titleKey = properties.titleKey
    this.titleParams = properties.titleParams
    this.definitions = term.definitions
    this.language = term.language
    this.theorem = term.theorem
    this.problem = term.problem

    this.cases = new LogIndCaseCollection(this, term.proofs)
    this.activeCase = new LogIndCase(this)
  }

  getObject () {
    const object = {
      definitions: this.definitions,
      language: this.language,
      problem: this.problem,
      proofs: this.cases.getObject(),
      theorem: this.theorem
    }
    if (this.activeCase.steps.some((step) => step.term !== '')) {
      object.proofs[''] = this.activeCase.getObject()
    }
    return object
  }

  setCases (cases) {
    this.cases = new LogIndCaseCollection(this, cases)
  }

  /**
        Gets the current/Last step of the exercise
        @return {LogIndStep} - The current/last step of the exercise
    */
  getCurrentStep () {
    return this.steps.getCurrentStep()
  }

  /**
        Gets the previous step of the exercise (last but one)
        @return {LogIndStep} - The previous step of the exercise (last but one)
    */
  getPreviousStep () {
    return this.steps.getPreviousStep()
  }

  deleteCase (index) {
    for (let i = index + 1; i < this.cases.cases.length; i++) {
      this.cases.cases[i].index -= 1
    }
    this.cases.cases.splice(index, 1)
  }
}
