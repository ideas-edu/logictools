import { IdeasServiceProxy } from '../ideasServiceProxy.js'
import { ExerciseSolver } from '../shared/exerciseSolver.js'
import { LogAxStepCollection } from './stepCollection.js'
import { LogAxStep } from './step.js'

/**
    LogAxExerciseSolver is responsible for solving one way exercises.
    @constructor
 */
export class LogAxExerciseSolver extends ExerciseSolver {
  constructor (config) {
    super(config)
    this.Step = LogAxStep
    this.StepCollection = LogAxStepCollection
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
      const steps = new this.StepCollection()
      const ds = data.derivation.derivation.derivationsteps
      const last = ds[ds.length - 1]
      for (const step of last.context.term) {
        steps.push(new this.Step(step))
      }
      onExerciseSolved(steps)
    }.bind(this)

    const state = this._getState(exercise)

    IdeasServiceProxy.derivation(this.config, state, onSuccess, onError)
  }

  _getState (exercise) {
    const state = {
      exerciseid: exercise.type,
      prefix: '[]',
      context: {
        term: [],
        environment: {},
        location: []
      }
    }

    for (const step of exercise.steps.steps) {
      state.context.term.push({
        number: step.number,
        term: step.term,
        label: step.label,
        references: step.references
      })
    }

    return state
  }
}
