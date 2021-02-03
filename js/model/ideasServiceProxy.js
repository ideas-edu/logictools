/* global unescape, location, $, jQuery */
/**
    IdeasServiceProxy is responsible for talking to the IDEAS web services.
    @constructor
 */
var IdeasServiceProxy = {

  /**
        Posts the requests to the IDEAS web services.
        @param input - The JSON request
        @param onSuccess - The callback method that gets called on success
        @param onError - The callback method that gets called on error
    */
  post: function (input, onSuccess, onError) {
    'use strict'
    const request = {}
    const url = 'http://ideas.cs.uu.nl/cgi-bin/ideas-logex.cgi'
    request.input = JSON.stringify(input)
    request.input = unescape(request.input.replace(/\\u/g, '%u'))
    request.path = '/cgi-bin/ideas-logex.cgi'

    if ((location.hostname.indexOf('uu.nl') === -1) && (location.hostname !== '')) {

      // ivm cors via een proxy gaan als we op een ander domein draaien dan de web services
      // indien geen domein dan draait het lokaal en is er geen php engine (dus dan direct).
      // url = "proxy.php";
      // url = "http://localhost/ideas-logex.cgi";
    }

    $.support.cors = true
    $.ajax({
      type: 'POST',
      url: url,
      data: jQuery.param(request),
      success: onSuccess,
      error: onError
    })
  },

  post2: function (method, params, onSuccess, onError, requestinfo) {
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
  },

  /* -----------------------------------------------------
       Feedback services for the outer loop
    ----------------------------------------------------- */

  // generate :: Exercise, Difficulty, UserId -> State
  generate: function (exerciseId, difficulty, userId, onSuccess, onError) {
    const params = [exerciseId, difficulty, userId]
    IdeasServiceProxy.post2('generate', params, onSuccess, onError)
  },

  // example :: Exercise, Int, UserId -> State
  example: function (exerciseId, exerciseNr, userId, onSuccess, onError) {
    const params = [exerciseId, exerciseNr, userId]
    IdeasServiceProxy.post2('example', params, onSuccess, onError)
  },

  // create :: Exercise, String -> State
  create: function (exerciseId, formula, userId, onSuccess, onError) {
    const params = [exerciseId, formula, userId]
    IdeasServiceProxy.post2('create', params, onSuccess, onError)
  },

  /* -----------------------------------------------------
       Feedback services for the inner loop
    ----------------------------------------------------- */

  // onefirst :: State -> StepInfo, State
  onefirst: function (state, requestinfo, onSuccess, onError) {
    state.push(LogEXSession.getIdentifiers(state[0]))
    IdeasServiceProxy.post2('onefirst', [state], onSuccess, onError, requestinfo)
  },

  // derivation :: State -> Derivation
  derivation: function (state, onSuccess, onError) {
    state.push(LogEXSession.getIdentifiers(state[0]))
    IdeasServiceProxy.post2('derivation', [state], onSuccess, onError)
  },

  // derivationtext :: State -> Derivation
  derivationtext: function (state, onSuccess, onError) {
    state.push(LogEXSession.getIdentifiers(state[0]))
    IdeasServiceProxy.post2('derivationtext', [state], onSuccess, onError)
  },

  // diagnose-string :: State, Context, (Rule)Id -> Diagnosis
  diagnose: function (state, formula, rule, onSuccess, onError) {
    state.push(LogEXSession.getIdentifiers(state[0]))
    let params = [state, formula, rule]
    if (rule === null) {
      params = [state, formula]
    }
    IdeasServiceProxy.post2('diagnose-string', params, onSuccess, onError)
  },

  // ready:: State -> Boolean
  ready: function (state, onSuccess, onError) {
    state.push(LogEXSession.getIdentifiers(state[0]))
    IdeasServiceProxy.post2('ready', [state], onSuccess, onError)
  },

  // log:: ? -> Empty
  log: function (state, requestinfo) {
    state.push(LogEXSession.getIdentifiers(state[0]))
    IdeasServiceProxy.post2('log', [state], null, null, requestinfo)
  }

}
