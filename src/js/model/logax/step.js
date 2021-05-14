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
    this.number = (theoremText.split('.')[0])
    theoremText = theoremText.replaceAll('->', '→')
    theoremText = theoremText.replaceAll('|-', '⊢')
    theoremText = theoremText.replaceAll('~', '¬')
    this.term = theoremText.split('.')[1]
    this.termKatex = katex.renderToString(this.term, {
      throwOnError: false
    })
  }
}
