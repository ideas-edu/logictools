import { Resources } from '../../resources.js'
import { LogEXSession } from '../../logEXSession.js'
import { IdeasServiceProxy } from '../ideasServiceProxy.js'
import { OneWayExercise } from './exercise.js'

export class OneWayExerciseGenerator {
  /**
        Generates a one way exercise.
        @param {string} ExerciseType - Type of exercise to be generated.  See exerciseTypes.js for the full list
        @param onExerciseGenerated - The callback function that is called after the exercise is generated.
        The callback function expects 1 parameter, the exercise.
        @param onErrorGeneratingExercise - The callback function that is called if there is a problem generating the exercise.
     */
  generate (exerciseType, ruleJustification, stepValidation, onExerciseGenerated, onErrorGeneratingExercise) {
    const exerciseId = Resources.getExerciseMethod(exerciseType)
    const userId = LogEXSession.getStudentId()
    const difficulty = LogEXSession.getDifficulty()
    const onError = onErrorGeneratingExercise
    const onSuccess = function (data) {
      this.onSuccess(data.generate, exerciseId, onErrorGeneratingExercise, onExerciseGenerated, ruleJustification, stepValidation)
    }.bind(this)

    IdeasServiceProxy.generate(exerciseId, difficulty, userId, onSuccess, onError)
  }

  example (exerciseNr, exerciseType, ruleJustification, stepValidation, onExerciseGenerated, onErrorGeneratingExercise) {
    const exerciseId = Resources.getExerciseMethod(exerciseType)
    const userId = LogEXSession.getStudentId()
    const onError = onErrorGeneratingExercise
    const onSuccess = function (data) {
      this.onSuccess(data.example, exerciseId, onErrorGeneratingExercise, onExerciseGenerated, ruleJustification, stepValidation)
    }.bind(this)

    IdeasServiceProxy.example(exerciseId, exerciseNr, userId, onSuccess, onError)
  }

  /**
        Creates an exercise based on input from the user.
        @param onExerciseCreated - The callback function that is called after the exercise is created.
        @param onErrorCreatingExercise - The callback function that is called if there is a problem creating the exercise.
     */
  create (exerciseId, formula, ruleJustification, stepValidation, onExerciseGenerated, onErrorGeneratingExercise) {
    const userId = LogEXSession.getStudentId()
    const onError = onErrorGeneratingExercise
    const onSuccess = function (data) {
      this.onSuccess(data.create, exerciseId, onErrorGeneratingExercise, onExerciseGenerated, ruleJustification, stepValidation)
    }.bind(this)

    IdeasServiceProxy.create(exerciseId, formula, userId, onSuccess, onError)
  }

  onSuccess (result, exerciseId, onErrorGeneratingExercise, onExerciseGenerated, ruleJustification, stepValidation) {
    if (result.state === null || result.state.context.term === null) {
      onErrorGeneratingExercise()
    } else {
      LogEXSession.setIdentifiers(exerciseId, result.state)
      const exercise = new OneWayExercise(result.state.context.term, exerciseId, ruleJustification, stepValidation)
      onExerciseGenerated(exercise)
    }
  }
}
