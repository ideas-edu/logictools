/**
    Represents a one way step.
    @constructor
    @param {string} formulaText - The text of the formula.
    @param {string} rule - The rule that is used in this step.
    @property {string} formula The formula.
    @property {string} rule The applied rule.
 */
function OneWayStep (formulaText, rule) {
  'use strict'
  this.formula = formulaText
  this.rule = rule
  this.isValid = false
  this.isSyntaxValid = true
  this.syntaxError = ''
  this.isRuleValid = false
  this.isBuggy = false
  this.isCorrect = true
  this.isSimilar = true
  this.buggyRule = ''
  this.isReady = false
  this.strategyStatus = '[]'
}
