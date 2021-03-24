import { describe, it } from 'mocha'
import { IdeasServiceProxy } from '../src/js/model/ideasServiceProxy.js'
import { XMLHttpRequest } from 'xhr2'
import { assert } from 'chai'

global.XMLHttpRequest = XMLHttpRequest

describe('ideasService', function () {
  describe('#post()', function () {
    it('should return response', function (done) {
      const onSuccess = function (response) {
        assert.equal(response.error, 'No service result')
        done()
      }
      const onFailure = function () {
        assert(false)
        done()
      }
      IdeasServiceProxy.post({}, onSuccess, onFailure)
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
      IdeasServiceProxy.post(request, onSuccess, onFailure)
    })
  })
})
