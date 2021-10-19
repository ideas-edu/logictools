import katex from 'katex'

/**
    Represents a one way step.
    @constructor
    @param {string} formulaText - The text of the formula.
    @param {string} rule - The rule that is used in this step.
    @property {string} formula The formula.
    @property {string} rule The applied rule.
 */
export class LogIndStep {
  constructor (step, rule, relation, number) {
    this.setTerm(step, [])
    this.number = number
    this.rule = rule
    this.relation = relation

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

  setTerm (term, functions) {
    this.term = term
    // This does not match the longest function
    let termAnnotated = term
    for (const functionName of functions) {
      termAnnotated = termAnnotated.replaceAll(functionName, `\\texttt{${functionName}}`)
    }

    this.termKatex = katex.renderToString(LogIndStep.convertToLatex(termAnnotated), {
      throwOnError: false
    })
  }

  getObject () {
    return {
      term: this.term
    }
  }
}
