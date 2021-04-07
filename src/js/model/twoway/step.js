import katex from 'katex'
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
export class TwoWayStep {
  constructor (formulaText, rule, direction) {
    this.formula = formulaText
    this.formulaKatex = katex.renderToString(formulaText, {
      throwOnError: false
    })
    this.rule = rule
    if (direction === 'top') {
      this.isTopStep = true
      this.isBottomStep = false
    }
    if (direction === 'bottom') {
      this.isTopStep = false
      this.isBottomStep = true
    }

    this.isValid = false
    this.isSyntaxValid = true
    this.isRuleValid = false
    this.isBuggy = false
    this.isCorrect = true
    this.isSimilar = true
    this.buggyRule = ''
    this.isReady = false
    this.strategyStatus = '[]'
    this.stepsRemaining = ''
    this.strategyLocation = ''
  }
}
