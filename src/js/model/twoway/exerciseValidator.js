import { IdeasServiceProxy } from '../ideasServiceProxy.js'
import { ExerciseValidator } from '../shared/exerciseValidator.js'

/**
    TwoWayExerciseValidator is responsible for validating two way exercises.
    @constructor
 */
export class TwoWayExerciseValidator extends ExerciseValidator {
  getState (exercise) {
    const state = {
      exerciseid: exercise.type,
      prefix: exercise.prefix,
      context: {
        term: exercise.steps.getObject(),
        environment: {},
        location: []
      }
    }

    return state
  }

  getContext (exercise) {
    const context = {
      term: exercise.steps.getObject(),
      environment: {},
      location: []
    }

    return context
  }

  validateStep (exercise, newStepObject, onValidated, onErrorValidatingStep) {
    const onError = onErrorValidatingStep
    const onSuccess = function (data) {
      if (data === null || data.error !== undefined) {
        if (data.error.slice(0, 7) === '(line 1') { // syntax error
          return
        }
        onErrorValidatingStep()
        return
      }
      if (data.diagnose.diagnosetype === 'notequiv') {
        onErrorValidatingStep()
        return
      }
      if (data.diagnose.state !== undefined) {
        onValidated(data.diagnose.state.context.term, data.diagnose.diagnosetype)
      } else {
        onValidated(data.diagnose.message, data.diagnose.diagnosetype)
      }
    }
    const state = this.getState(exercise)
    const context = this.getContext(newStepObject)
    IdeasServiceProxy.diagnose(this.config, state, context, null, onSuccess, onError)
  }

}
