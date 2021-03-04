import $ from 'jquery'

import { config } from '../config.js'
import { LogEXSession } from '../logEXSession.js'

/**
    IdeasServiceProxy is responsible for talking to the IDEAS web services.
    @constructor
 */
export class IdeasServiceProxy {
  /**
        Posts the requests to the IDEAS web services.
        @param input - The JSON request
        @param onSuccess - The callback method that gets called on success
        @param onError - The callback method that gets called on error
    */
  static post (input, onSuccess, onError) {
    const request = {}
    const url = config.backend_url
    request.input = JSON.stringify(input)
    request.input = unescape(request.input.replace(/\\u/g, '%u'))

    $.support.cors = true
    $.ajax({
      type: 'POST',
      url: url,
      data: $.param(request),
      success: onSuccess,
      error: onError
    })
  }

  static post2 (method, params, onSuccess, onError, requestinfo) {
    const input = {
      source: config.source,
      method: method,
      params: params,
      requestinfo: requestinfo,
      logging: 'v2'
    }

    const onError3 = function (jqXHR, textStatus, errorThrown) {
      onError()
    }

    IdeasServiceProxy.post(input, onSuccess, onError3)
  }

  /* -----------------------------------------------------
       Feedback services for the outer loop
    ----------------------------------------------------- */

  // generate :: Exercise, Difficulty, UserId -> State
  static generate (exerciseId, difficulty, userId, onSuccess, onError) {
    const params = [exerciseId, difficulty, userId]
    IdeasServiceProxy.post2('generate', params, onSuccess, onError)
  }

  // example :: Exercise, Int, UserId -> State
  static example (exerciseId, exerciseNr, userId, onSuccess, onError) {
    const params = [exerciseId, exerciseNr, userId]
    IdeasServiceProxy.post2('example', params, onSuccess, onError)
  }

  // create :: Exercise, String -> State
  static create (exerciseId, formula, userId, onSuccess, onError) {
    const params = [exerciseId, formula, userId]
    IdeasServiceProxy.post2('create', params, onSuccess, onError)
  }

  /* -----------------------------------------------------
       Feedback services for the inner loop
    ----------------------------------------------------- */

  // onefirst :: State -> StepInfo, State
  static onefirst (state, requestinfo, onSuccess, onError) {
    state.push(LogEXSession.getIdentifiers(state[0]))
    IdeasServiceProxy.post2('onefirst', [state], onSuccess, onError, requestinfo)
  }

  // derivation :: State -> Derivation
  static derivation (state, onSuccess, onError) {
    state.push(LogEXSession.getIdentifiers(state[0]))
    IdeasServiceProxy.post2('derivation', [state], onSuccess, onError)
  }

  // derivationtext :: State -> Derivation
  static derivationtext (state, onSuccess, onError) {
    state.push(LogEXSession.getIdentifiers(state[0]))
    IdeasServiceProxy.post2('derivationtext', [state], onSuccess, onError)
  }

  // diagnose-string :: State, Context, (Rule)Id -> Diagnosis
  static diagnose (state, formula, rule, onSuccess, onError) {
    state.push(LogEXSession.getIdentifiers(state[0]))
    let params = [state, formula, rule]
    if (rule === null) {
      params = [state, formula]
    }
    IdeasServiceProxy.post2('diagnose-string', params, onSuccess, onError)
  }

  // ready:: State -> Boolean
  static ready (state, onSuccess, onError) {
    state.push(LogEXSession.getIdentifiers(state[0]))
    IdeasServiceProxy.post2('ready', [state], onSuccess, onError)
  }

  // log:: ? -> Empty
  static log (state, requestinfo) {
    state.push(LogEXSession.getIdentifiers(state[0]))
    IdeasServiceProxy.post2('log', [state], null, null, requestinfo)
  }
}
