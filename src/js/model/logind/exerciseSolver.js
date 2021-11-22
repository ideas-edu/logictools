import { IdeasServiceProxy } from '../ideasServiceProxy.js'
import { ExerciseSolver } from '../shared/exerciseSolver.js'
import { LogIndExercise } from './exercise.js'
import { LogIndCaseCollection } from './stepCollection.js'
import { LogIndStep } from './step.js'

/**
    LogIndExerciseSolver is responsible for solving one way exercises.
    @constructor
 */
export class LogIndExerciseSolver extends ExerciseSolver {
  constructor (config) {
    super(config)
    this.Step = LogIndStep
    this.StepCollection = LogIndCaseCollection
  }

  /**
        Solves a exercise.
        @param {OneWayExercise} exercise - The exercise that needs to be solved.
        @param onExerciseSolved - The callback function that is called after the exercise is solved.
        The callback function expects 1 parameter, a ProofStepCollection.
        @param onErrorSolvingExercise - The callback function that is called if there is a problem solving the exercise.
     */
  solve (exercise, onExerciseSolved, onErrorSolvingExercise) {
    const onError = onErrorSolvingExercise
    const onSuccess = function (data) {
      if (data === null || data.error !== undefined || data.derivation.derivation.derivationsteps === null) {
        onErrorSolvingExercise()
        return
      }
      const ds = data.derivation.derivation.derivationsteps
      const last = ds[ds.length - 1]
      exercise.setCases(last.context.term.proofs)
      console.log(exercise)
      onExerciseSolved(exercise)
    }

    const state = this._getState(exercise)

    IdeasServiceProxy.derivation(this.config, state, onSuccess, onError)
  }

  _getState (exercise) {
    const state = {
      exerciseid: exercise.type,
      prefix: '[]',
      context: {
        term: exercise.getObject(),
        environment: {},
        location: []
      }
    }

    return state
  }
}
