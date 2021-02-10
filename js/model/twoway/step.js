/* global Equation */
/**
    Represents a proof step.
    @constructor
    @param {string} equationText - The text of the equation.
    @param {string} rule - The rule that is used in this step.
    @property {Equation} equation The equation.
    @property {string} rule The applied rule.
    @property {Boolean} isTopStep True if the step is applied to the top formula, false otherwise.
    @property {Boolean} isBottomStep True if the step is applied to the bottom formula, false otherwise.
 */
export function TwoWayStep (equationText, rule) {
  'use strict'

  this.equation = new Equation(equationText)
  this.rule = rule
  this.isTopStep = false
  this.isBottomStep = false

  this.isValid = false
  this.isSyntaxValid = true
  this.isRuleValid = false
  this.isBuggy = false
  this.isCorrect = true
  this.isSimilar = true
  this.buggyRule = ''
  this.isReady = false
  this.strategyStatus = '[]'
  this.stepsRemaining = 0
  this.strategyLocation = ''
}
