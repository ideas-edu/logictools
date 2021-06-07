import { ExerciseSolver } from '../shared/exerciseSolver.js'
import { OneWayStepCollection } from './stepCollection.js'
import { OneWayStep } from './step.js'

/**
    OneWayExerciseSolver is responsible for solving one way exercises.
    @constructor
 */
export class OneWayExerciseSolver extends ExerciseSolver {
  constructor (config) {
    super(config)
    this.Step = OneWayStep
    this.StepCollection = OneWayStepCollection
  }
}
