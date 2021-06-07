import { ExerciseGenerator } from '../shared/exerciseGenerator.js'
import { OneWayExercise } from './exercise.js'

export class OneWayExerciseGenerator extends ExerciseGenerator {
  constructor (config) {
    super(config)
    this.Exercise = OneWayExercise
  }
}
