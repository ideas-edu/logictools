import { LogEXSession } from '../../logEXSession.js'
import { IdeasServiceProxy } from '../ideasServiceProxy.js'
import { OneWayExercise } from './exercise.js'

/**
    OneWayExerciseCreator is responsible for handling manually created exercises.
    @constructor
 */
export function OneWayExerciseCreator () {
  'use strict'

  /**
        Creates an exercise.
        @param onExerciseCreated - The callback function that is called after the exercise is created.
        @param onErrorCreatingExercise - The callback function that is called if there is a problem creating the exercise.
     */
  this.create = function (exerciseId, formula, ruleJustification, stepValidation, onExerciseCreated, onErrorCreatingExercise) {
    const userId = LogEXSession.getStudentId()
    const onError = onErrorCreatingExercise
    const onSuccess = function (data) {
      if (data === null || data.error !== null || data.result === null || data.result[2] === null) {
        onErrorCreatingExercise(data.error)
      } else {
        LogEXSession.setIdentifiers(exerciseId, data.result[4])
        const exercise = new OneWayExercise(data.result[2], exerciseId, ruleJustification, stepValidation)
        onExerciseCreated(exercise)
      }
    }

    IdeasServiceProxy.create(exerciseId, formula, userId, onSuccess, onError)
  }
}
