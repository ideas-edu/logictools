import { IdeasServiceProxy } from '../ideasServiceProxy.js'
import { ExerciseValidator } from '../shared/exerciseValidator.js'
import { LogIndStep } from './step.js'

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
      term: exercise.getObject(),
      environment: {},
      location: []
    }

    return context
  }

  validateExercise (exercise, onValidated, onErrorValidatingStep) {
    const onError = onErrorValidatingStep
    const onSuccess = function (data) {
      if (data === null || data.error !== undefined) {
        if (data.error.slice(0, 7) === '(line 1') { // syntax error
          return
        }
        onErrorValidatingStep()
        return
      }
      switch (data.diagnose.diagnosetype) {
        case 'similar':
          onValidated('similar')
          break
        case 'notequiv':
          onValidated('notequiv')
          break
      }
      onValidated()
    }

    const state = this.getState(exercise)
    const context = this.getContext(exercise)
    IdeasServiceProxy.diagnose(this.config, state, context, null, onSuccess, onError)
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
