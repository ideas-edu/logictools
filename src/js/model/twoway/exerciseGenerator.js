import { ExerciseGenerator } from '../shared/exerciseGenerator.js'
import { TwoWayExercise } from './exercise.js'

export class TwoWayExerciseGenerator extends ExerciseGenerator {
  constructor (config) {
    super(config)
    this.Exercise = TwoWayExercise
  }
}
