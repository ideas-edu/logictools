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
        term: step.term,
        label: step.label
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
      if (!response.apply) {
        onErrorValidating()
        return
      }
      exercise.steps.steps = []
      for (const responseStep of response.apply.state.context.term) {
        const newStep = new LogAxStep(responseStep)
        exercise.steps.push(newStep)
      }
      onValidated()
    }
    IdeasServiceProxy.apply(this.config, state, step.environment, [], step.rule, validated, onErrorValidating)
  }
}
