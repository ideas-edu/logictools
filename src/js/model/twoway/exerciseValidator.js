import { ExerciseValidator } from '../shared/exerciseValidator.js'

/**
    TwoWayExerciseValidator is responsible for validating two way exercises.
    @constructor
 */
export class TwoWayExerciseValidator extends ExerciseValidator {
  getState (exercise, step1) {
    const state = {
      exerciseid: exercise.type,
      prefix: step1.strategyStatus,
      context: {
        term: step1.equation.getText(),
        environment: {},
        location: []
      }
    }

    return state
  }

  getContext (step2) {
    const context = {
      term: step2.equation.getText(),
      environment: {},
      location: []
    }

    return context
  }
}
