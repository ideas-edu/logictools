import { IdeasServiceProxy } from '../ideasServiceProxy.js'
import { ExerciseValidator } from '../shared/exerciseValidator.js'

/**
    LogIndExerciseValidator is responsible for validating one way exercises.
    @constructor
 */
export class LogIndExerciseValidator extends ExerciseValidator {
  getState (exercise) {
    const state = {
      exerciseid: exercise.type,
      prefix: '[]',
      context: {
        term: exercise.getObject(),
        environment: {},
        location: []
      }
    }

    return state
  }

  getContext (exercise) {
    const context = {
      term: exercise,
      environment: {},
      location: []
    }

    return context
  }

  validateExercise (exercise, newStepObject, onValidated, onErrorValidatingStep) {
    const onError = onErrorValidatingStep
    const onSuccess = function (data) {
      if (data === null || data.error !== undefined) {
        if (data.error.slice(0, 7) === '(line 1') { // syntax error
          return
        }
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

  checkConstraints (exercise, onFinished, onError) {
    const state = this.getState(exercise)

    const validated = function (response) {
      if (!response.constraints) {
        onError()
        return
      }

      onFinished(response.constraints)
    }
    IdeasServiceProxy.constraints(this.config, state, validated, onError)
  }

  isFinished (exercise, onFinished, onError) {
    const state = this.getState(exercise)

    const validated = function (response) {
      if (!response.finished) {
        onError()
        return
      }

      onFinished(response.finished)
    }
    IdeasServiceProxy.finished(this.config, state, validated, onError)
  }
}
