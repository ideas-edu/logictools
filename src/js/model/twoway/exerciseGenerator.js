import { ExerciseGenerator } from '../shared/exerciseGenerator.js'
import { TwoWayExercise } from './exercise.js'

export class TwoWayExerciseGenerator extends ExerciseGenerator {
  constructor () {
    super()
    this.Exercise = TwoWayExercise
  }
}
