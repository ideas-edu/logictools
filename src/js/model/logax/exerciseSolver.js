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
}
