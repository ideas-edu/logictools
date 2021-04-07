import katex from 'katex'

/**
    Represents a one way step.
    @constructor
    @param {string} formulaText - The text of the formula.
    @param {string} rule - The rule that is used in this step.
    @property {string} formula The formula.
    @property {string} rule The applied rule.
 */
export class OneWayStep {
  constructor (formulaText, rule) {
    this.formula = formulaText
    this.formulaKatex = katex.renderToString(formulaText, {
      throwOnError: false
    })
    this.rule = rule
    this.number = null
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
}
