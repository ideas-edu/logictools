import { describe, it } from 'mocha'
import { IdeasServiceProxy } from '../src/js/model/ideasServiceProxy.js'
import pkg from 'xhr2';
const { XMLHttpRequest } = pkg;
import { assert } from 'chai'

global.XMLHttpRequest = XMLHttpRequest

const config = {
  source: 'logex'
}

describe('ideasService', function () {
  describe('#post()', function () {
    it('should return response', function (done) {
      const onSuccess = function (response) {
        assert.equal(response.error, 'No service result')
        done()
      }
      const onFailure = function (response) {
        assert(false)
        done()
      }
      IdeasServiceProxy.post(config, {}, onSuccess, onFailure)
    })

    it('should return generated exercise', function (done) {
      const request = {
        service: 'generate',
        exerciseid: 'logic.propositional.proof.unicode'
      }
      const onSuccess = function (response) {
        assert.equal(response.generate.state.exerciseid, 'logic.propositional.proof.unicode')
        assert.isAtLeast(response.generate.state.context.term.length, 1)
        done()
      }
      const onFailure = function () {
        assert(false)
        done()
      }
      IdeasServiceProxy.post(config, request, onSuccess, onFailure)
    })
  })
})
