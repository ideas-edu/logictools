import { describe, it } from 'mocha'
import { Formula } from '../src/js/model/shared/formula.js'
import { assert } from 'chai'

describe('formulaSyntax', function () {
  describe('errors', function () {
    it('should have error Missing closing parenthesis', function () {
      const formula = new Formula('p∧(s∧(s∧¬r)')
      assert.equal(formula.error.message, 'Missing closing parenthesis')
      assert.equal(formula.error.index, 3)
    })

    it('should have error Unexpected character', function () {
      const formula = new Formula('p∧s∧(x∧¬r)')
      assert.equal(formula.error.message, 'Unexpected character')
      assert.equal(formula.error.index, 6)
    })

    it('should have error Missing operator', function () {
      const formula = new Formula('p∧s(p∧¬r)')
      assert.equal(formula.error.message, 'Missing operator')
      assert.equal(formula.error.index, 3)
    })

    it('should have error Ambiguous associativity', function () {
      const formula = new Formula('p∧s∨(p∧¬r)')
      assert.equal(formula.error.message, 'Ambiguous associativity')
      assert.equal(formula.error.index, 3)
    })

    it('should have error Missing literal or group', function () {
      const formula = new Formula('p∧r∧')
      assert.equal(formula.error.message, 'Missing literal or group')
      assert.equal(formula.error.index, 4)
    })
  })
})
