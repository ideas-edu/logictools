import { describe, it } from 'mocha'
import { Formula } from '../src/js/model/shared/formula.js'
import { assert } from 'chai'

const fOptions = {
  unaryOperators: ['¬'],
  binaryOperators: ['∧', '∨', '→', '↔', ','],
  implicitAssociativeBinaryOperators: ['∧', '∨', ','],
  firstOrderOperators: [','],
  implicitPrecendence: [{ strong: ',', weak: '→' }],
  literals: ['p', 'q', 'r', 's', 'T', 'F']
}

const fOptionsMulti = {
  unaryOperators: ['func'],
  binaryOperators: ['∧', '∨', '→', '↔', ','],
  implicitAssociativeBinaryOperators: ['∧', '∨', ','],
  firstOrderOperators: [','],
  implicitPrecendence: [{ strong: ',', weak: '→' }],
  literals: ['p', 'q', 'r', 's', 'T', 'F']
}

describe('formulaSyntax', function () {
  describe('errors', function () {
    it('should have error Missing closing parenthesis (nested groups)', function () {
      const formula = new Formula('p∧(s∧(s∧¬r)', fOptions)
      assert.equal(formula.error.message, 'Missing closing parenthesis')
      assert.equal(formula.error.params.index, 3)
    })

    it('should have error Missing closing parenthesis (multiple separate groups)', function () {
      const formula = new Formula('(p∧q)→(s∨¬r', fOptions)
      assert.equal(formula.error.message, 'Missing closing parenthesis')
      assert.equal(formula.error.params.index, 7)
    })

    it('should have error Unexpected character (in expression)', function () {
      const formula = new Formula('p∧s∧(x∧¬r)', fOptions)
      assert.equal(formula.error.message, 'Unexpected character')
      assert.equal(formula.error.params.index, 6)
    })

    it('should have error Unexpected character', function () {
      const formula = new Formula('p∧(y∧¬r)', fOptions)
      assert.equal(formula.error.message, 'Unexpected character')
      assert.equal(formula.error.params.index, 4)
    })

    it('should have error Missing operator', function () {
      const formula = new Formula('p∧s(p∧¬r)', fOptions)
      assert.equal(formula.error.message, 'Missing operator')
      assert.equal(formula.error.params.index, 4)
    })

    it('should have error Missing operator (group)', function () {
      const formula = new Formula('(p∨q)r', fOptions)
      assert.equal(formula.error.message, 'Missing operator')
      assert.equal(formula.error.params.index, 6)
    })

    it('should have error Missing operator (before unary)', function () {
      const formula = new Formula('(q∨¬r)∧(q¬q)', fOptions)
      assert.equal(formula.error.message, 'Missing operator')
      assert.equal(formula.error.params.index, 10)
    })

    it('should have error Ambiguous associativity', function () {
      const formula = new Formula('p∧s∨(p∧¬r)', fOptions)
      assert.equal(formula.error.message, 'Ambiguous associativity')
      assert.equal(formula.error.params.index, 4)
    })

    it('should have error Ambiguous associativity (non-implicit)', function () {
      const formula = new Formula('p→s→r', fOptions)
      assert.equal(formula.error.message, 'Ambiguous associativity')
      assert.equal(formula.error.params.index, 4)
    })

    it('should have error Empty parentheses', function () {
      const formula = new Formula('q→()', fOptions)
      assert.equal(formula.error.message, 'Empty parentheses')
      assert.equal(formula.error.params.index, 4)
    })

    it('should have error Missing operand', function () {
      const formula = new Formula('p∧r∧', fOptions)
      assert.equal(formula.error.message, 'Missing operand')
      assert.equal(formula.error.params.index, 5)
    })

    it('should have error Missing operand (subroutine)', function () {
      const formula = new Formula('¬(q→r)∨q∨∨r', fOptions)
      assert.equal(formula.error.message, 'Missing operand')
      assert.equal(formula.error.params.index, 10)
    })

    it('should have error Missing operand (subroutine 2)', function () {
      const formula = new Formula('¬(q→r)∨q∨(r∨r)∨r∨', fOptions)
      assert.equal(formula.error.message, 'Missing operand')
      assert.equal(formula.error.params.index, 18)
    })

    it('should have error Missing operand (unary)', function () {
      const formula = new Formula('¬(p∧q)∨s∨¬', fOptions)
      assert.equal(formula.error.message, 'Missing operand')
      assert.equal(formula.error.params.index, 11)
    })

    it('should have error Missing operand (group)', function () {
      const formula = new Formula('¬(p∧q)∨', fOptions)
      assert.equal(formula.error.message, 'Missing operand')
      assert.equal(formula.error.params.index, 8)
    })

    it('should have error Missing operand, multiple operators', function () {
      const formula = new Formula('(p→∧q)', fOptions)
      assert.equal(formula.error.message, 'Missing operand')
      assert.equal(formula.error.params.index, 4)
    })

    it('should have error Missing operand after parentheses', function () {
      const formula = new Formula('¬((∨p↔q)→(p∨(p↔q)))', fOptions)
      assert.equal(formula.error.message, 'Missing operand')
      assert.equal(formula.error.params.index, 4)
    })

    it('should have error Missing operator', function () {
      const formula = new Formula('(q∨¬rp)∧(q∨p))∨¬q', fOptions)
      assert.equal(formula.error.message, 'Missing operator')
      assert.equal(formula.error.params.index, 6)
    })

    it('should have error Missing open parenthesis', function () {
      const formula = new Formula('(q∨¬r)∧(q∨p))∨¬q', fOptions)
      assert.equal(formula.error.message, 'Missing open parenthesis')
      assert.equal(formula.error.params.index, 13)
    })
  })
  describe('success', function () {
    it('should succeed', function () {
      const formula = new Formula('¬q∧¬(q→q)∧p', fOptions)
      assert.equal(formula.error, null)
    })

    it('should succeed implicit associativity', function () {
      const formula = new Formula('p∧s∧r', fOptions)
      assert.equal(formula.error, null)
    })

    it('should succeed operator with multiple characters', function () {
      const formula = new Formula('func(p)', fOptionsMulti)
      assert.equal(formula.error, null)
    })
  })
  describe('flatten', function () {
    it('single operator', function () {
      const formula = new Formula('p∧q', fOptions).result
      assert.equal(formula.printUnicode(), formula.flatten().printUnicode())
    })

    it('two operators', function () {
      const formula = new Formula('p∧q∧r', fOptions).result
      const flattened = formula.flatten()
      assert.equal(formula.printUnicode(), flattened.printUnicode())
      assert.deepEqual(flattened.expressions.map(e => e.printUnicode()), ['p', 'q', 'r'])
    })

    it('three operators', function () {
      const formula = new Formula('p∧q∧r∧s', fOptions).result
      const flattened = formula.flatten()
      assert.equal(formula.printUnicode(), flattened.printUnicode())
      assert.deepEqual(flattened.expressions.map(e => e.printUnicode()), ['p', 'q', 'r', 's'])
    })

    it('parentheses child', function () {
      const formula = new Formula('p∧(q∧r)∧s', fOptions).result
      const flattened = formula.flatten()
      assert.equal(formula.printUnicode(), flattened.printUnicode())
      assert.deepEqual(flattened.expressions.map(e => e.printUnicode()), ['p', '(q∧r)', 's'])
    })
  })
  describe('precedence', function () {
    it('weak strong', function () {
      const formula = new Formula('p→q,p', fOptions)
      assert.equal(formula.error, null)
      assert.equal(formula.result.operator, ',')
    })
    it('strong weak', function () {
      const formula = new Formula('p,p→q', fOptions)
      assert.equal(formula.error, null)
      assert.equal(formula.result.operator, ',')
    })
    it('strong weak', function () {
      const formula = new Formula('p,p→(q→p),q', fOptions)
      assert.equal(formula.error, null)
      assert.equal(formula.result.operator, ',')
    })
  })
  describe('first order operator', function () {
    it('nested', function () {
      const formula = new Formula('p,(q,p)', fOptions)
      assert.equal(formula.error.message, 'Operator out of order')
      assert.equal(formula.error.params.index, 5)
    })
  })
})
