import katex from 'katex'

import { Formula } from './shared/formula.js'

/**
    SyntaxValidator is responsible for validating the syntax of a formula.
    @constructor
 */
export class SyntaxValidator {
  /**
        Validates the syntax of a formula.
        @param {string} formulaText - The formula text.
        @param onValidated - The callback function that is called after the syntax validation.
        The callback function should provide 2 parameters, a boolean (isValid) and a string (formulaText)
     */
  validateSyntax (formulaText, formulaOptions) {
    const formulaTrimmed = formulaText.replaceAll(' ', '')
    const formula = new Formula(formulaTrimmed, formulaOptions)
    if (formula.error !== null) {
      const text = formulaTrimmed.replaceAll('\\', '@').replaceAll('{', '?').replaceAll('}', '<')
      const formulaWithNotation = this._underlineText(text, formula.error.params.index - 1, formula.error.params.index + formula.error.params.length - 1)
      const escaspedFormula = formulaWithNotation.replaceAll('@', '\\backslash ').replaceAll('?', '\\{').replaceAll('<', '\\}')
      formula.error.params.formula = katex.renderToString(escaspedFormula, {
        throwOnError: false
      })
    }
    return formula.error
  }

  _underlineText (text, startIndex, endIndex) {
    if (startIndex === endIndex) {
      return `${text.slice(0, startIndex)}\\underline{\\hspace{1em}}${text.slice(endIndex)}`
    } else {
      return `${text.slice(0, startIndex)}\\underline{${text.slice(startIndex, endIndex)}}${text.slice(endIndex)}`
    }
  }
}
