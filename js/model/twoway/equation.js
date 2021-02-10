/* global $ */
/**
    Represents an equation.
    @constructor
    @param {string} text - The text of the equation.
    @property {string} formula1 The first formula.
    @property {string} formula2 The second formula.
 */
export function Equation (text) {
  'use strict'
  if (text !== undefined) {
    const formulae = text.split('==')

    this.formula1 = $.trim(formulae[0])
    this.formula2 = $.trim(formulae[1])
  }

  /**
        Gets the text of the equation.
        @return {string} - The text of the equation.
     */
  this.getText = function () {
    return this.formula1 + ' == ' + this.formula2
  }

  /**
        Sets formula 1.
        @param {string} formulaText - The text of the formula.
     */
  this.setFormula1 = function (formulaText) {
    this.formula1 = $.trim(formulaText)
  }

  /**
        Sets formula 2.
        @param {string} formulaText - The text of the formula.
     */
  this.setFormula2 = function (formulaText) {
    this.formula2 = $.trim(formulaText)
  }

  this.getEquationIsSolved = function () {
    return this.formula1 === this.formula2
  }
}
