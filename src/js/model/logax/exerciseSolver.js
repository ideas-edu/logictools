import { ExerciseSolver } from '../shared/exerciseSolver.js'
import { LogAxStepCollection } from './stepCollection.js'
import { LogAxStep } from './step.js'

/**
    LogAxExerciseSolver is responsible for solving one way exercises.
    @constructor
 */
export class LogAxExerciseSolver extends ExerciseSolver {
  constructor (config) {
    super(config)
    this.Step = LogAxStep
    this.StepCollection = LogAxStepCollection
  }

  _getState (exercise) {
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
        label: step.label,
        references: step.references
      })
    }

    return state
  }
}
