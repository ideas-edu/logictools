import { LogIndCaseCollection } from './stepCollection.js'
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
    this.constraints = null

    this.cases = new LogIndCaseCollection(this, term.proofs)
    if (term.active) {
      this.activeCase = this.cases.cases.find(x => x.identifier === term.active)
    } else {
      this.activeCase = null
    }

    this.baseCasesStatus = 'notStarted'
    this.hypothesesStatus = 'notStarted'
    this.inductiveStepsStatus = 'notStarted'
  }

  getObject () {
    const object = {
      definitions: this.definitions,
      language: this.language,
      problem: this.problem,
      proofs: this.cases.getObject(),
      theorem: this.theorem,
      active: null
    }
    if (this.activeCase !== null) {
      object.active = this.activeCase.identifier
      if (this.activeCase.steps.some((step) => step.term !== '') && this.activeCase.identifier === '') {
        object.proofs[''] = this.activeCase.getObject()
      }
    }
    return object
  }

  setCases (cases, activeCase) {
    const oldIdentifiers = []
    for (const _case of this.cases.cases) {
      oldIdentifiers.push(_case.identifier)
    }
    this.cases = new LogIndCaseCollection(this, cases)
    if (activeCase) {
      this.activeCase = this.cases.cases.find(x => x.identifier === activeCase)
    } else {
      this.activeCase = null
      // If there is no active case and there is a new case given make this the active case
      for (const _case of this.cases.cases) {
        if (!oldIdentifiers.includes(_case.identifier)) {
          this.activeCase = _case
          break
        }
      }
    }
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

  getCase (index, type) {
    switch (type) {
      case 'baseCase':
        return this.cases.baseCases[index]
      case 'hypothesis':
        return this.cases.hypotheses[index]
      case 'inductiveStep':
        return this.cases.inductiveSteps[index]
    }
  }

  addCase (_case) {
    switch (_case.type) {
      case 'baseCase':
        _case.index = this.cases.baseCases.length
        this.cases.baseCases.push(_case)
        break
      case 'hypothesis':
        _case.index = this.cases.hypotheses.length
        this.cases.hypotheses.push(_case)
        break
      case 'inductiveStep':
        _case.index = this.cases.inductiveSteps.length
        this.cases.inductiveSteps.push(_case)
        break
    }
  }

  deleteCase (index, type) {
    let set = null

    switch (type) {
      case 'baseCase':
        set = this.cases.baseCases
        break
      case 'hypothesis':
        set = this.cases.hypotheses
        break
      case 'inductiveStep':
        set = this.cases.inductiveSteps
        break
    }

    for (let i = index + 1; i < set.length; i++) {
      set[i].index -= 1
    }

    set.splice(index, 1)
  }
}
