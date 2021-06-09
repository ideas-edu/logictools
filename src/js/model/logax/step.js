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
  constructor (step, rule) {
    this.number = step.number
    this.label = step.label
    this.references = step.references
    if (rule === undefined && step.label !== undefined) {
      rule = `logic.propositional.axiomatic.${step.label}`
    }
    this.rule = rule
    if (rule !== undefined) {
      this.ruleKey = `rule.${rule}`
    }
    this.term = step.term
    this.termKatex = katex.renderToString(LogAxStep.convertToLatex(this.term), {
      throwOnError: false
    })

    // Highlights
    this.highlightStep = false
    this.highlightTerm = false
    this.highlightRule = false
  }

  static convertToLatex (term) {
    term = term.replaceAll('->', '\\rightarrow ')
    term = term.replaceAll('|-', '\\vdash ')
    term = term.replaceAll('~', '\\neg ')
    return term
  }

  static convertToText (term) {
    term = term.replaceAll('→', '->')
    term = term.replaceAll('⊢', '|-')
    term = term.replaceAll('¬', '~')
    return term
  }

  getReferences () {
    return this.references !== undefined ? this.references.join(', ') : null
  }
}
