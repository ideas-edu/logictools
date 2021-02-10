/* global LogEXSession, IdeasServiceProxy */
/**
    SyntaxValidator is responsible for validating the syntax of a formula.
    @constructor
 */
export function SyntaxValidator () {
  'use strict'

  /**
        Validates the syntax of a formula.
        @param {string} formulaText - The formula text.
        @param onValidated - The callback function that is called after the syntax validation.
        The callback function should provide 2 parameters, a boolean (isValid) and a string (formulaText)
     */
  this.validateSyntax = function (formulaText, onValidated) {
    // eigenlijk misbruiken we de diagnose web service omdat er geen losse syntax validatie web service is
    const state = ['logic.propositional.proof.unicode', '[]', formulaText + '==T', '']
    const formula = formulaText + '==T'
    const rule = null

    const onError = function () {
      onValidated(false, formulaText)
    }

    const onSuccess = function (data) {
      if (data === null || data.error !== null || data.result === null) {
        onValidated(false, formulaText)
      } else {
        onValidated(true, formulaText)
      }
    }

    IdeasServiceProxy.diagnose(state, formula, rule, onSuccess, onError)
  }
}
