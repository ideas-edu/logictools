/* global Equation, TwoWayStepCollection, TwoWayStep */
/**
    Represents a two way exercise.
    @constructor
    @param {string} equationText - The text of the equation.
    @property {Equation} equation The equation.
    @property {ProofStepCollection} steps The collection of proof steps.
 */
export function TwoWayExercise (equationText, exerciseType, stepValidation) {
  'use strict'

  this.type = exerciseType
  this.usesStepValidation = stepValidation
  this.isReady = false
  this.equation = new Equation(equationText)
  this.steps = new TwoWayStepCollection(new TwoWayStep(equationText))

  /**
        Gets the current step.
        @return {ProofStep} - The current step.
    */
  this.getCurrentStep = function () {
    return this.steps.getCurrentStep()
  }

  /**
        Gets the previous step.
        @return {ProofStep} - The previous step.
    */
  this.getPreviousStep = function () {
    return this.steps.getPreviousStep()
  }
}
