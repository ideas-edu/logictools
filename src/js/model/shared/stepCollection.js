/**
    StepCollection is an bastract class for ordered lists of conversion steps.
    @constructor
    @param {ProofStep} baseStep - The first proof step.
 */
export class StepCollection {
  setSteps (exercise, _case) {
    this.exercise = exercise
    this.steps = []

    if (_case === undefined) {
      _case = {}
      return
    }

    let rule = null
    let relation = null
    let number = 0
    let isTopStep = true
    let currentStep = null
    for (const step of _case) {
      if (isTopStep) {
        if (step.constructor === String) {
          this.steps.push(new this.Step(this, step, rule, relation, number, isTopStep))
        } else {
          rule = step.motivation
          relation = step.type
          if (rule === '<GAP>') {
            this.proofRelation = relation
            relation = null
            rule = null
            isTopStep = false
          }
          number += 1
        }
      } else {
        // Bottom step
        if (step.constructor === String) {
          currentStep = step
          this.steps.push(new this.Step(this, currentStep, rule, relation, number, isTopStep))
        } else {
          rule = step.motivation
          relation = step.type
          number += 1
          currentStep = null
        }
      }
    }
  }

  /**
        Gets the current step.
        @return {OneWayStep} The current step.
     */
  getCurrentStep () {
    return this.steps[this.steps.length - 1]
  }

  /**
        Gets the previous step.
        @return {ProofStep} The previous step.
     */
  getPreviousStep () {
    if (this.steps.length === 1) {
      return this.baseStep
    }
    return this.steps[this.steps.length - 2]
  }

  /**
        Gets all the steps.
        @return {OneWayStep[]} The steps.
     */
  getSteps () {
    return this.steps
  }

  get topSteps () {
    return this.steps.filter(x => x.isTopStep)
  }

  get bottomSteps () {
    return this.steps.filter(x => !x.isTopStep)
  }

  /**
        Removes the latest oneway step from the collection.
     */
  pop () {
    this.steps.pop()
  }

  /**
        Removes the top steps starting from the specified index.
        @param {Number} index - The start index.
     */
  removeTopSteps (index) {
    this.steps = this.steps.slice(0, index)
  }

  insertTopStep () {
    for (const bottomStep of this.bottomSteps) {
      bottomStep.number += 1
    }
    const index = this.topSteps.length
    const newStep = new this.Step(this, '', null, null, index, true)
    this.steps.splice(index, 0, newStep)
    return newStep
  }

  insertBottomStep () {
    for (const bottomStep of this.bottomSteps) {
      bottomStep.number += 1
    }
    const index = this.steps.length - this.bottomSteps.length
    const newStep = new this.Step(this, '', null, null, index, false)
    this.steps.splice(index, 0, newStep)
    return newStep
  }
}
