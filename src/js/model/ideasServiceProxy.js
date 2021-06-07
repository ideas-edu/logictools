import config from '../../../config.json'
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
  static post (toolConfig, input, onSuccess, onError) {
    const url = config.backend_url
    input.source = toolConfig.source
    const data = 'input=' + encodeURI(JSON.stringify(input))

    const request = new XMLHttpRequest()

    request.open('POST', url, true)
    request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8')
    request.responseType = 'json'

    request.onload = function () {
      const resp = this.response
      if (onSuccess !== undefined) {
        onSuccess(resp)
      }
    }
    request.onerror = function () {
      const resp = this.response
      if (onError !== undefined) {
        onError(resp)
      }
    }

    request.send(data)
  }

  /* -----------------------------------------------------
       Feedback services for the outer loop
    ----------------------------------------------------- */

  // generate :: Exercise, Difficulty, UserId -> State
  static generate (toolConfig, exerciseId, difficulty, userid, onSuccess, onError) {
    const request = {
      service: 'generate',
      exerciseid: exerciseId,
      difficulty: difficulty,
      userid: userid
    }

    IdeasServiceProxy.post(toolConfig, request, onSuccess, onError)
  }

  // example :: Exercise, Int, UserId -> State
  static example (toolConfig, exerciseId, exerciseNr, userid, onSuccess, onError) {
    const request = {
      service: 'example',
      exerciseid: exerciseId,
      nr: exerciseNr,
      userid: userid
    }

    IdeasServiceProxy.post(toolConfig, request, onSuccess, onError)
  }

  // create :: Exercise, String -> State
  static create (toolConfig, exerciseId, formula, userid, onSuccess, onError) {
    const request = {
      service: 'create',
      exerciseid: exerciseId,
      term: formula,
      userid: userid
    }

    IdeasServiceProxy.post(toolConfig, request, onSuccess, onError)
  }

  /* -----------------------------------------------------
       Feedback services for the inner loop
    ----------------------------------------------------- */

  // onefirst :: State -> StepInfo, State
  static onefirst (toolConfig, state, requestinfo, onSuccess, onError) {
    state = LogEXSession.applyIdentifiers(state)
    const request = {
      service: 'onefirst',
      state: state
    }

    IdeasServiceProxy.post(toolConfig, request, onSuccess, onError)
  }

  // derivation :: State -> Derivation
  static derivation (toolConfig, state, onSuccess, onError) {
    state = LogEXSession.applyIdentifiers(state)
    const request = {
      service: 'derivation',
      state: state
    }

    IdeasServiceProxy.post(toolConfig, request, onSuccess, onError)
  }

  // derivationtext :: State -> Derivation
  static derivationtext (toolConfig, state, onSuccess, onError) {
    state = LogEXSession.applyIdentifiers(state)
    const request = {
      service: 'derivationtext',
      state: state
    }

    IdeasServiceProxy.post(toolConfig, request, onSuccess, onError)
  }

  // diagnose-string :: State, Context, (Rule)Id -> Diagnosis
  static diagnose (toolConfig, state, context, rule, onSuccess, onError) {
    state = LogEXSession.applyIdentifiers(state)
    const request = {
      service: 'diagnose',
      state: state,
      context: context,
      rule: rule
    }

    IdeasServiceProxy.post(toolConfig, request, onSuccess, onError)
  }

  // ready:: State -> Boolean
  static ready (toolConfig, state, onSuccess, onError) {
    state = LogEXSession.applyIdentifiers(state)
    const request = {
      service: 'ready',
      state: state
    }

    IdeasServiceProxy.post(toolConfig, request, onSuccess, onError)
  }

  // ready:: State -> Boolean
  static finished (toolConfig, state, onSuccess, onError) {
    state = LogEXSession.applyIdentifiers(state)
    const request = {
      service: 'finished',
      state: state
    }

    IdeasServiceProxy.post(toolConfig, request, onSuccess, onError)
  }

  // apply:: State -> Boolean
  static apply (toolConfig, state, environment, location, rule, onSuccess, onError) {
    state = LogEXSession.applyIdentifiers(state)
    const request = {
      service: 'apply',
      state: state,
      environment: environment,
      location: location,
      rule: rule
    }

    IdeasServiceProxy.post(toolConfig, request, onSuccess, onError)
  }

  // log:: ? -> Empty
  static log (toolConfig, state, requestinfo) {
    state = LogEXSession.applyIdentifiers(state)
    const request = {
      service: 'log',
      state: state
    }

    IdeasServiceProxy.post(toolConfig, request, undefined, undefined)
  }
}
