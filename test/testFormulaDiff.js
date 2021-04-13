import { describe, it } from 'mocha'
import { showdiff } from '../src/js/showdiff.js'
import { assert } from 'chai'

describe('formulaSyntax', function () {
  describe('errors', function () {
    it('should show difference (literal)', function () {
      const diff = showdiff('p', 'r').printStyled()
      assert.equal(diff, '<span class=\'formula-highlight\'>r</span>')
    })

    it('should show no difference (literal)', function () {
      const diff = showdiff('r', 'r').printStyled()
      assert.equal(diff, 'r')
    })

    it('should show difference (different types)', function () {
      const diff = showdiff('¬¬r', 'r').printStyled()
      assert.equal(diff, '<span class=\'formula-highlight\'>r</span>')
    })

    it('should show difference (unary)', function () {
      const diff = showdiff('¬r', '¬s').printStyled()
      assert.equal(diff, '¬<span class=\'formula-highlight\'>s</span>')
    })

    it('should show difference (implication def)', function () {
      const diff = showdiff('r→s', '¬r∨s').printStyled()
      assert.equal(diff, '<span class=\'formula-highlight\'>¬r∨s</span>')
    })

    it('should show no difference (multiple and)', function () {
      const diff = showdiff('p∧q∧r∧s', 'p∧q∧r∧s').printStyled()
      assert.equal(diff, 'p∧q∧r∧s')
    })

    it('should show difference (implication def (nested))', function () {
      const diff = showdiff('q∧(r→s)', 'q∧(¬r∨s)').printStyled()
      assert.equal(diff, 'q∧(<span class=\'formula-highlight\'>¬r∨s</span>)')
    })

    it('should show difference (implication def (nested, lost parentheses))', function () {
      const diff = showdiff('(q∨(p→q))∨p', '(q∨¬p∨q)∨p').printStyled()
      assert.equal(diff, '(q∨<span class=\'formula-highlight\'>¬p∨q</span>)∨p')
    })

    it('should show difference (implication def (nested, lost parentheses))', function () {
      const diff = showdiff('(q∨¬r)∧(q∨p)∧¬q', '(q∨¬r)∧((q∧¬q)∨(p∧¬q))').printStyled()
      assert.equal(diff, '(q∨¬r)∧(<span class=\'formula-highlight\'>(q∧¬q)∨(p∧¬q)</span>)')
    })

    it('should show difference (implication def (nested, lost parentheses))', function () {
      const diff = showdiff('(p∧¬q)∨F∨(q∧¬p)', '(p∧¬q)∨(q∧¬p)').printStyled()
      assert.equal(diff, '(p∧¬q)∨(q∧¬p)')
    })
  })
})
