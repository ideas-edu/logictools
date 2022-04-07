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
  constructor (collection, step, rule, relation, number, isTopStep) {
    this._collection = collection
    this.setTerm(step)
    this.number = number
    // if (relation === '<=') {
    //   this.relation = '≤'
    // } else if (relation === '>=') {
    //   this.relation = '≥'
    // } else {
    this.relation = relation
    // }
    this.rule = rule

    this.isTopStep = isTopStep
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

  setTerm (term) {
    this.formula = term
    this.formulaKatex = katex.renderToString(term, {
      throwOnError: false
    })
  }
}
