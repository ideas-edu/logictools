import { ExerciseValidator } from '../shared/exerciseValidator.js'

/**
    OneWayExerciseValidator is responsible for validating one way exercises.
    @constructor
 */
export class OneWayExerciseValidator extends ExerciseValidator {
  getState (exercise, step1, step2) {
    const state = {
      exerciseid: exercise.type,
      prefix: step1.strategyStatus,
      context: {
        term: step1.formula,
        environment: {},
        location: []
      }
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
}
