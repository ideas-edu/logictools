import { IdeasServiceProxy } from '../ideasServiceProxy.js'
import { OneWayStepCollection } from './stepCollection.js'
import { OneWayStep } from './step.js'

/**
    OneWayExerciseSolver is responsible for solving one way exercises.
    @constructor
 */
export class OneWayExerciseSolver {
  /**
        Solves a one way exercise.
        @param {OneWayExercise} exercise - The exercise that needs to be solved.
        @param onExerciseSolved - The callback function that is called after the exercise is solved.
        The callback function expects 1 parameter, a ProofStepCollection.
        @param onErrorSolvingExercise - The callback function that is called if there is a problem solving the exercise.
     */
  solve (exercise, onExerciseSolved, onErrorSolvingExercise) {
    const onError = onErrorSolvingExercise
    const onSuccess = function (data) {
      if (data === null || data.error !== null || data.result === null || data.result[0][1] === undefined) {
        onErrorSolvingExercise()
        return
      }
      const onewaySteps = new OneWayStepCollection(new OneWayStep(exercise.formula, null))
      data.result.forEach(function (item) {
        onewaySteps.push(new OneWayStep(item[2], item[0]))
      })
      onExerciseSolved(onewaySteps)
    }

    const state = this.getState(exercise)

    IdeasServiceProxy.derivation(state, onSuccess, onError)
  }

  /**
        Solves the next step of a one way exercise.
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
          onErrorSolvingNextStep('no-step-possible')
        } else {
          onErrorSolvingNextStep('error-solving-next-step')
        }
        return
      }

      if (data.onefirst.length === 0) {
        onErrorSolvingNextStep('error-solving-last-step')
        return
      }
      const result = data.onefirst.first
      const nextStep = new OneWayStep(result.state.context.term, result.step.rule)
      if (nextStep) {
        onNextStepSolved(nextStep)
      }
    }

    const state = this.getState(exercise)

    IdeasServiceProxy.onefirst(state, 'nextStep', onSuccess, onError)
  }

  /**
        Gets the help for the next step of a one way exercise.
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
          onErrorGettingHelpForNextStep('no-step-possible')
        } else {
          onErrorGettingHelpForNextStep('error-showing-hint')
        }
      } else {
        const currentStep = exercise.steps.getCurrentStep()
        const onewaySteps = new OneWayStepCollection(new OneWayStep(currentStep.formula, null))
        const result = data.onefirst.first
        onewaySteps.push(new OneWayStep(result.state.context.term, result.step.rule))
        onHelpForNextStepFound(onewaySteps.getCurrentStep())
      }
    }

    const state = this.getState(exercise)

    IdeasServiceProxy.onefirst(state, 'Hint: useRule', onSuccess, onError)
  }

  getState (exercise) {
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
