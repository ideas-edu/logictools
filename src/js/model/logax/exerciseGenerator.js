import { ExerciseGenerator } from '../shared/exerciseGenerator.js'
import { LogAxExercise } from './exercise.js'

export class LogAxExerciseGenerator extends ExerciseGenerator {
  constructor () {
    super()
    this.Exercise = LogAxExercise
  }
}
