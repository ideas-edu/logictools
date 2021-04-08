import { describe, it } from 'mocha'
import { Formula } from '../src/js/model/shared/formula.js'
import { assert } from 'chai'

describe('formulaSyntax', function () {
  describe('errors', function () {
    it('should have error Missing closing parenthesis (nested groups)', function () {
      const formula = new Formula('p∧(s∧(s∧¬r)')
      assert.equal(formula.error.message, 'Missing closing parenthesis')
      assert.equal(formula.error.params.index, 3)
    })

    it('should have error Missing closing parenthesis (multiple separate groups)', function () {
      const formula = new Formula('(p∧q)→(s∨¬r')
      assert.equal(formula.error.message, 'Missing closing parenthesis')
      assert.equal(formula.error.params.index, 7)
    })

    it('should have error Unexpected character', function () {
      const formula = new Formula('p∧s∧(x∧¬r)')
      assert.equal(formula.error.message, 'Unexpected character')
      assert.equal(formula.error.params.index, 6)
    })

    it('should have error Missing operator', function () {
      const formula = new Formula('p∧s(p∧¬r)')
      assert.equal(formula.error.message, 'Missing operator')
      assert.equal(formula.error.params.index, 4)
    })

    it('should have error Missing operator (group)', function () {
      const formula = new Formula('(p∨q)r')
      assert.equal(formula.error.message, 'Missing operator')
      assert.equal(formula.error.params.index, 6)
    })

    it('should have error Ambiguous associativity', function () {
      const formula = new Formula('p∧s∨(p∧¬r)')
      assert.equal(formula.error.message, 'Ambiguous associativity')
      assert.equal(formula.error.params.index, 4)
    })

    it('should have error Empty parentheses', function () {
      const formula = new Formula('q→()')
      assert.equal(formula.error.message, 'Empty parentheses')
      assert.equal(formula.error.params.index, 4)
    })

    it('should have error Missing operand', function () {
      const formula = new Formula('p∧r∧')
      assert.equal(formula.error.message, 'Missing operand')
      assert.equal(formula.error.params.index, 5)
    })

    it('should have error Missing operand (subroutine)', function () {
      const formula = new Formula('¬(q→r)∨q∨∨r')
      assert.equal(formula.error.message, 'Missing operand')
      assert.equal(formula.error.params.index, 10)
    })

    it('should have error Missing operand (subroutine 2)', function () {
      const formula = new Formula('¬(q→r)∨q∨(r∨r)∨r∨')
      assert.equal(formula.error.message, 'Missing operand')
      assert.equal(formula.error.params.index, 18)
    })

    it('should have error Missing operand (unary)', function () {
      const formula = new Formula('¬(p∧q)∨s∨¬')
      assert.equal(formula.error.message, 'Missing operand')
      assert.equal(formula.error.params.index, 11)
    })

    it('should have error Missing operand (group)', function () {
      const formula = new Formula('¬(p∧q)∨')
      assert.equal(formula.error.message, 'Missing operand')
      assert.equal(formula.error.params.index, 8)
    })
  })
})
