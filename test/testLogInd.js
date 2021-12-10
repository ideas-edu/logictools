import { describe, it } from 'mocha'
import { convertH2M, convertM2H } from '../src/js/model/logind/step.js'
import { assert } from 'chai'

const DEFINITIONS = ['max', 'min', 'union', 'set', 'del', 'subst', 'supp']

describe('logind', function () {
  describe('success', function () {
    it('conversion should be inverse functions', function () {
      const term = 'union (supp (subst q p (phi&&psi))) (set q)'
      assert.equal(term, convertM2H(convertH2M(term, DEFINITIONS), DEFINITIONS))
    })

    it('conversion should be inverse functions', function () {
      const term = 'supp([q/p] phi) union {q} union supp([q/p] psi) union {q}'
      assert.equal(term, convertH2M(convertM2H(term, DEFINITIONS), DEFINITIONS))
    })
  })
})
