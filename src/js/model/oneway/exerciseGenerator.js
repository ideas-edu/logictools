import { ExerciseGenerator } from '../shared/exerciseGenerator.js'
import { OneWayExercise } from './exercise.js'

export class OneWayExerciseGenerator extends ExerciseGenerator {
  constructor () {
    super()
    this.Exercise = OneWayExercise
  }
}
