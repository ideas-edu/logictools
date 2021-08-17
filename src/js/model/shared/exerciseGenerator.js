import { ExerciseTypes } from '../exerciseTypes.js'
import { LogEXSession } from '../../logEXSession.js'
import { IdeasServiceProxy } from '../ideasServiceProxy.js'

// Abstract class for generator
export class ExerciseGenerator {
  constructor (config) {
    this.Exercise = undefined
    this.config = config
  }

  /**
        Generates a one way exercise.
        @param {string} ExerciseType - Type of exercise to be generated.  See exerciseTypes.js for the full list
        @param onExerciseGenerated - The callback function that is called after the exercise is generated.
        The callback function expects 1 parameter, the exercise.
        @param onErrorGeneratingExercise - The callback function that is called if there is a problem generating the exercise.
     */
  generate (exerciseType, properties, onExerciseGenerated, onErrorGeneratingExercise) {
    const exerciseId = ExerciseTypes[exerciseType]
    const userId = LogEXSession.getStudentId()
    const difficulty = properties.difficulty
    const onError = onErrorGeneratingExercise
    const onSuccess = function (data) {
      this.onSuccess(data.generate, exerciseId, onErrorGeneratingExercise, onExerciseGenerated, properties)
    }.bind(this)

    IdeasServiceProxy.generate(this.config, exerciseId, difficulty, userId, onSuccess, onError)
  }

  example (exerciseNr, exerciseType, properties, onExerciseGenerated, onErrorGeneratingExercise) {
    const exerciseId = ExerciseTypes[exerciseType]
    const userId = LogEXSession.getStudentId()
    const onError = onErrorGeneratingExercise
    const onSuccess = function (data) {
      this.onSuccess(data.example, exerciseId, onErrorGeneratingExercise, onExerciseGenerated, properties)
    }.bind(this)

    IdeasServiceProxy.example(this.config, exerciseId, exerciseNr, userId, onSuccess, onError)
  }

  /**
        Creates an exercise based on input from the user.
        @param onExerciseCreated - The callback function that is called after the exercise is created.
        @param onErrorCreatingExercise - The callback function that is called if there is a problem creating the exercise.
     */
  create (exerciseId, context, properties, onExerciseGenerated, onErrorGeneratingExercise) {
    const userId = LogEXSession.getStudentId()
    const onError = onErrorGeneratingExercise
    const onSuccess = function (data) {
      this.onSuccess(data.create, exerciseId, onErrorGeneratingExercise, onExerciseGenerated, properties)
    }.bind(this)

    IdeasServiceProxy.create(this.config, exerciseId, context, userId, onSuccess, onError)
  }

  onSuccess (result, exerciseId, onErrorGeneratingExercise, onExerciseGenerated, properties) {
    if (result === undefined || result.state === undefined || result.state.context.term === null) {
      onErrorGeneratingExercise()
    } else {
      LogEXSession.setIdentifiers(exerciseId, result.state)
      const exercise = new this.Exercise(result.state.context.term, exerciseId, properties)
      onExerciseGenerated(exercise)
    }
  }
}
