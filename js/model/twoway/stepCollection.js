/* global jQuery, Rules */
/**
    TwoWayStepCollection is an ordered list of proof steps.
    @constructor
    @param {ProofStep} baseStep - The first proof step.
 */
function TwoWayStepCollection (baseStep) {
  'use strict'

  this.steps = []

  if (baseStep !== null) {
    this.steps.push(baseStep)
  }

  /**
        Gets the current step.
        @return {ProofStep} The current step.
    */
  this.getCurrentStep = function () {
    return this.steps[this.steps.length - 1]
  }

  /**
        Gets the previous step.
        @return {ProofStep} The previous step.
    */
  this.getPreviousStep = function () {
    if (this.steps.length === 1) {
      return baseStep
    }
    return this.steps[this.steps.length - 2]
  }

  /**
    Gets all the top step.
        @return {ProofStep[]} The top steps.
    */
  this.getTopSteps = function () {
    return jQuery.grep(this.steps, function (step, i) {
      return (step.isTopStep)
    })
  }

  /**
        Gets all the bottom step.
        @return {ProofStep[]} The bottom steps.
    */
  this.getBottomSteps = function () {
    return jQuery.grep(this.steps, function (step, i) {
      return (step.isBottomStep)
    })
  }

  /**
        Adds a proof step to the collection.
        @param {ProofStep} proofStep - The proof step.
     */
  this.push = function (proofStep) {
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

  /**
        Removes the latest proof step from the collection.
     */
  this.pop = function () {
    this.steps.pop()
  }

  /**
        Removes the bottom steps starting from the specified index.
        @param {Number} index - The start index.
     */
  this.removeBottomSteps = function (index) {
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
  this.removeTopSteps = function (index) {
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
