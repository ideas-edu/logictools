import { ExerciseValidator } from '../shared/exerciseValidator.js'

/**
    TwoWayExerciseValidator is responsible for validating two way exercises.
    @constructor
 */
export class TwoWayExerciseValidator extends ExerciseValidator {
  getState (exercise, step1, step2) {
    console.log(exercise)
    const state = {
      exerciseid: exercise.type,
      prefix: step1.strategyStatus,
      context: {
        term: exercise.equation.getText(),
        environment: {},
        location: []
      }
    }

    return state
  }

  getContext (exercise, step2) {
    let term = null
    if (step2.isTopStep) {
      term = `${step2.formula} == ${exercise.equation.formula2}`
    } else {
      term = `${exercise.equation.formula1} == ${step2.formula}`
    }
    const context = {
      term: term,
      environment: {},
      location: []
    }

    return context
  }
}
