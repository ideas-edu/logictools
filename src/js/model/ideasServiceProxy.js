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
    const url = config.backend_url
    input.source = config.source
    const data = 'input=' + encodeURI(JSON.stringify(input))

    const request = new XMLHttpRequest()

    request.open('POST', url, true)
    request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8')
    request.responseType = 'json'

    request.onload = function () {
      const resp = this.response
      onSuccess(resp)
    }
    request.onerror = function () {
      const resp = this.response
      onError(resp)
    }

    request.send(data)
  }

  /* -----------------------------------------------------
       Feedback services for the outer loop
    ----------------------------------------------------- */

  // generate :: Exercise, Difficulty, UserId -> State
  static generate (exerciseId, difficulty, userid, onSuccess, onError) {
    const request = {
      service: 'generate',
      exerciseid: exerciseId,
      difficulty: difficulty,
      userid: userid
    }

    IdeasServiceProxy.post(request, onSuccess, onError)
  }

  // example :: Exercise, Int, UserId -> State
  static example (exerciseId, exerciseNr, userid, onSuccess, onError) {
    const request = {
      service: 'example',
      exerciseid: exerciseId,
      nr: exerciseNr,
      userid: userid
    }

    IdeasServiceProxy.post(request, onSuccess, onError)
  }

  // create :: Exercise, String -> State
  static create (exerciseId, formula, userid, onSuccess, onError) {
    const request = {
      service: 'create',
      exerciseid: exerciseId,
      term: formula,
      userid: userid
    }

    IdeasServiceProxy.post(request, onSuccess, onError)
  }

  /* -----------------------------------------------------
       Feedback services for the inner loop
    ----------------------------------------------------- */

  // onefirst :: State -> StepInfo, State
  static onefirst (state, requestinfo, onSuccess, onError) {
    state = LogEXSession.applyIdentifiers(state)
    const request = {
      service: 'onefirst',
      state: state
    }

    IdeasServiceProxy.post(request, onSuccess, onError)
  }

  // derivation :: State -> Derivation
  static derivation (state, onSuccess, onError) {
    state = LogEXSession.applyIdentifiers(state)
    const request = {
      service: 'derivation',
      state: state
    }

    IdeasServiceProxy.post(request, onSuccess, onError)
  }

  // derivationtext :: State -> Derivation
  static derivationtext (state, onSuccess, onError) {
    state = LogEXSession.applyIdentifiers(state)
    const request = {
      service: 'derivationtext',
      state: state
    }

    IdeasServiceProxy.post(request, onSuccess, onError)
  }

  // diagnose-string :: State, Context, (Rule)Id -> Diagnosis
  static diagnose (state, context, rule, onSuccess, onError) {
    state = LogEXSession.applyIdentifiers(state)
    const request = {
      service: 'diagnose',
      state: state,
      context: context,
      rule: rule
    }
    console.log("req", request)

    IdeasServiceProxy.post(request, onSuccess, onError)
  }

  // ready:: State -> Boolean
  static ready (state, onSuccess, onError) {
    state = LogEXSession.applyIdentifiers(state)
    const request = {
      service: 'ready',
      state: state
    }

    IdeasServiceProxy.post(request, onSuccess, onError)
  }

  // log:: ? -> Empty
  static log (state, requestinfo) {
    state = LogEXSession.applyIdentifiers(state)
    const request = {
      service: 'log',
      state: state
    }

    IdeasServiceProxy.post(request, undefined, undefined)

    // state.push(LogEXSession.getIdentifiers(state[0]))
    // IdeasServiceProxy.post2('log', [state], null, null, requestinfo)
  }
}
