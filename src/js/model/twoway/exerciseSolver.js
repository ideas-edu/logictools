import { IdeasServiceProxy } from '../ideasServiceProxy.js'
import { ExerciseSolver } from '../shared/exerciseSolver.js'
import { TwoWayStepCollection } from './stepCollection.js'
import { TwoWayStep } from './step.js'

/**
    TwoWayExerciseSolver is responsible for solving Two way exercises.
    @constructor
 */
export class TwoWayExerciseSolver extends ExerciseSolver {
  constructor (config) {
    super(config)
    this.Step = TwoWayStep
    this.StepCollection = TwoWayStepCollection
  }

  _getState (exercise) {
    const state = {
      exerciseid: exercise.type,
      prefix: exercise.prefix,
      context: {
        term: exercise.steps.getObject(),
        environment: {},
        location: []
      }
    }

    if (exercise.direction !== undefined) {
      state.context.environment.direction = exercise.direction
    }

    return state
  }

  solve (exercise, onExerciseSolved, onErrorSolvingExercise) {
    const onError = onErrorSolvingExercise
    const onSuccess = function (data) {
      if (data === null || data.error !== undefined || data.derivation.derivation.derivationsteps === null) {
        onErrorSolvingExercise()
        return
      }
      const steps = new this.StepCollection(exercise.equation)
      const ds = data.derivation.derivation.derivationsteps
      const last = ds[ds.length - 1]
      // for (const step of last.context.term) {
      //   steps.push(new this.Step(step))
      // }

      onExerciseSolved(last.context.term)
    }.bind(this)

    const state = this._getState(exercise)

    IdeasServiceProxy.derivation(this.config, state, onSuccess, onError)
  }

  /**
        Solves the next step of an exercise.
        @param {OneWayExercise} exercise - the exercise of which the next step must be solved.
        @param onNextStepSolved - The callback function that is called after the next step is solved.
        The callback function expects 1 parameter, a OneWayStep.
        @param onErrorSolvingNextStep - The callback function that is called if there is a problem solving the next step.
     */
  solveNextStep (exercise, onNextStepSolved, onErrorSolvingNextStep) {
    const onError = onErrorSolvingNextStep
    const onSuccess = function (data) {
      if (data === null || data.error !== undefined || data.onefirst === null) {
        if (data.error.search(/No step/i) >= 0) {
          onErrorSolvingNextStep('twoWay.error.noStepPossible')
        } else {
          onErrorSolvingNextStep('shared.error.solvingNextStep')
        }
        return
      }

      if (data.onefirst.length === 0) {
        onErrorSolvingNextStep('shared.error.solvingLastStep')
        return
      }
      const result = data.onefirst.first.state.context.term
      exercise.prefix = data.onefirst.first.state.prefix
      if (result) {
        onNextStepSolved(result)
      }
    }.bind(this)

    const state = this._getState(exercise)

    IdeasServiceProxy.onefirst(this.config, state, 'nextStep', onSuccess, onError)
  }

  getHelpForNextStep (exercise, onHelpForNextStepFound, onErrorGettingHelpForNextStep) {
    const onError = onErrorGettingHelpForNextStep
    const onSuccess = function (data) {
      if (data === null || data.error !== undefined || data.onefirst === null) {
        if (data.error.search(/No step/i) >= 0) {
          onErrorGettingHelpForNextStep('twoWay.error.noStepPossible')
        } else {
          onErrorGettingHelpForNextStep('shared.error.showingHint')
        }
      } else {
        const result = data.onefirst.first
        onHelpForNextStepFound({
          term: result.state.context.term,
          rule: result.step.rule,
          stepEnvironment: result.state.context.environment
        })
      }
    }

    const state = this._getState(exercise)
    IdeasServiceProxy.onefirst(this.config, state, 'Hint: useRule', onSuccess, onError)
  }
}
