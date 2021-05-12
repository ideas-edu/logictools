import katex from 'katex'

/**
    Represents a one way step.
    @constructor
    @param {string} formulaText - The text of the formula.
    @param {string} rule - The rule that is used in this step.
    @property {string} formula The formula.
    @property {string} rule The applied rule.
 */
export class LogAxStep {
  constructor (theoremText, rule) {
    this.theorem = theoremText
    this.theoremKatex = katex.renderToString(theoremText, {
      throwOnError: false
    })
    this.rule = rule
    this.number = null
  }
}
