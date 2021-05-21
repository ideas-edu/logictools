import { IdeasServiceProxy } from '../ideasServiceProxy.js'
import { ExerciseValidator } from '../shared/exerciseValidator.js'
import { LogAxStep } from './step.js'

/**
    LogAxExerciseValidator is responsible for validating one way exercises.
    @constructor
 */
export class LogAxExerciseValidator extends ExerciseValidator {
  getState (exercise) {
    const state = {
      exerciseid: exercise.type,
      prefix: '[]',
      context: {
        term: [],
        environment: {},
        location: []
      }
    }

    for (const step of exercise.steps.steps) {
      state.context.term.push({
        number: step.number,
        term: step.term
      })
    }

    return state
  }

  getContext (exercise, step2) {
    const context = {
      term: step2.formula,
      environment: {},
      location: []
    }

    return context
  }

  validateApply (exercise, step, onValidated, onErrorValidating) {
    const state = this.getState(exercise)

    const validated = function (response) {
      for (const responseStep of response.apply.state.context.term) {
        let exists = false
        for (const existingStep of exercise.steps.steps) {
          if (responseStep.number === existingStep.number) {
            exists = true
          }
        }
        if (!exists) {
          const newStep = new LogAxStep(responseStep)
          onValidated(newStep)
          return
        }
      }
    }
    IdeasServiceProxy.apply(this.config, state, step.environment, [], step.rule, validated, onErrorValidating)
  }
}
