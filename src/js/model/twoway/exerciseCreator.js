import { LogEXSession } from '../../logEXSession.js'
import { Resources } from '../../resources.js'
import { IdeasServiceProxy } from '../ideasServiceProxy.js'
import { TwoWayExercise } from './exercise.js'

/**
    TwoWayExerciseCreator is responsible for handling manually created exercises.
    @constructor
 */
export function TwoWayExerciseCreator () {
  'use strict'

  /**
        Creates an exercise.
        @param ExerciseType - Type of exercise to be created.  See exerciseTypes.js for the full list
        @param onExerciseCreated - The callback function that is called after the exercise is created.
        @param onErrorCreatingExercise - The callback function that is called if there is a problem creating the exercise.
     */
  this.create = function (exerciseType, stepValidation, formula, onExerciseCreated, onErrorCreatingExercise) {
    const exerciseId = Resources.getExerciseMethod(exerciseType)
    const userId = LogEXSession.getStudentId()
    const onError = onErrorCreatingExercise
    const onSuccess = function (data) {
      if (data === null || data.error !== null || data.result === null || data.result[2] === null) {
        onErrorCreatingExercise(data.error)
      } else {
        LogEXSession.setIdentifiers(exerciseId, data.result[4])
        const exercise = new TwoWayExercise(data.result[2], exerciseId, stepValidation)
        onExerciseCreated(exercise)
      }
    }

    IdeasServiceProxy.create(exerciseId, formula, userId, onSuccess, onError)
  }
}
