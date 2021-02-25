import katex from 'katex'

/**
    Represents an equation.
    @constructor
    @param {string} text - The text of the equation.
    @property {string} formula1 The first formula.
    @property {string} formula2 The second formula.
 */
export class Equation {
  constructor (text) {
    if (text !== undefined) {
      const formulae = text.split('==')

      this.formula1 = formulae[0].trim()
      this.formula2 = formulae[1].trim()
      this.formula1katex = katex.renderToString(this.formula1, {
        throwOnError: false
      })
      this.formula2katex = katex.renderToString(this.formula2, {
        throwOnError: false
      })
    }
  }

  /**
        Gets the text of the equation.
        @return {string} - The text of the equation.
     */
  getText () {
    return this.formula1 + ' == ' + this.formula2
  }

  /**
        Sets formula 1.
        @param {string} formulaText - The text of the formula.
     */
  setFormula1 (formulaText) {
    this.formula1 = formulaText.trim()
  }

  /**
        Sets formula 2.
        @param {string} formulaText - The text of the formula.
     */
  setFormula2 (formulaText) {
    this.formula2 = formulaText.trim()
  }

  getEquationIsSolved () {
    return this.formula1 === this.formula2
  }
}
