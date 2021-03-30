import { IdeasServiceProxy } from '../ideasServiceProxy.js'

/**
    ExerciseSolver is an abstract class for solvers
    @constructor
 */
export class ExerciseSolver {
  constructor () {
    this.Step = undefined
    this.StepCollection = undefined
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
      const steps = new this.StepCollection(new this.Step(exercise.formula, null))
      const ds = data.derivation.derivation.derivationsteps
      for (const i in ds) {
        steps.push(new this.Step(ds[i].context.term, ds[i].step.rule))
      }
      onExerciseSolved(steps)
    }.bind(this)

    const state = this._getState(exercise)

    IdeasServiceProxy.derivation(state, onSuccess, onError)
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
          onErrorSolvingNextStep('shared.error.noStepPossible')
        } else {
          onErrorSolvingNextStep('shared.error.solvingNextStep')
        }
        return
      }

      if (data.onefirst.length === 0) {
        onErrorSolvingNextStep('shared.error.solvingLastStep')
        return
      }
      const result = data.onefirst.first
      const nextStep = new this.Step(result.state.context.term, result.step.rule)
      if (nextStep) {
        onNextStepSolved(nextStep)
      }
    }.bind(this)

    const state = this._getState(exercise)

    IdeasServiceProxy.onefirst(state, 'nextStep', onSuccess, onError)
  }

  /**
        Gets the help for the next step of an exercise.
        @param {OneWayExercise} exercise - The exercise of which the hint for the next step must be given.
        @param onHelpForNextStepFound - The callback function that is called after the help for the next step is found.
        The callback function expects 1 parameter, a OneWayStep.
        @param onErrorGettingHelpForNextStep - The callback function that is called if there is a problem getting help for the next step.
     */
  getHelpForNextStep (exercise, onHelpForNextStepFound, onErrorGettingHelpForNextStep) {
    const onError = onErrorGettingHelpForNextStep
    const onSuccess = function (data) {
      if (data === null || data.error !== undefined || data.onefirst === null) {
        if (data.error.search(/No step/i) >= 0) {
          onErrorGettingHelpForNextStep('shared.error.noStepPossible')
        } else {
          onErrorGettingHelpForNextStep('shared.error.showingHint')
        }
      } else {
        const currentStep = exercise.steps.getCurrentStep()
        const onewaySteps = new this.StepCollection(new this.Step(currentStep.formula, null))
        const result = data.onefirst.first
        onewaySteps.push(new this.Step(result.state.context.term, result.step.rule))
        onHelpForNextStepFound(onewaySteps.getCurrentStep())
      }
    }.bind(this)

    const state = this._getState(exercise)

    IdeasServiceProxy.onefirst(state, 'Hint: useRule', onSuccess, onError)
  }

  _getState (exercise) {
    const currentStep = exercise.steps.getCurrentStep()
    let currentStrategy
    let currentFormula

    if (currentStep === null) {
      currentFormula = exercise.formula
      currentStrategy = '[]'
    } else {
      currentFormula = currentStep.formula
      currentStrategy = currentStep.strategyStatus
    }

    const state = {
      exerciseid: exercise.type,
      prefix: currentStrategy,
      context: {
        term: currentFormula,
        environment: {},
        location: []
      }
    }

    return state
  }
}
