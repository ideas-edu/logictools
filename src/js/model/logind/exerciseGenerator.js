import { ExerciseGenerator } from '../shared/exerciseGenerator.js'
import { LogIndExercise } from './exercise.js'

export class LogIndExerciseGenerator extends ExerciseGenerator {
  constructor (config) {
    super(config)
    this.Exercise = LogIndExercise
  }
}
