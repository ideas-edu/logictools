import { IdeasServiceProxy } from '../ideasServiceProxy.js'
import { OneWayStepCollection } from './stepCollection.js'
import { OneWayStep } from './step.js'

/**
    OneWayExerciseSolver is responsible for solving one way exercises.
    @constructor
 */
export function OneWayExerciseSolver () {
  'use strict'

  /**
        Solves a one way exercise.
        @param {OneWayExercise} exercise - The exercise that needs to be solved.
        @param onExerciseSolved - The callback function that is called after the exercise is solved.
        The callback function expects 1 parameter, a ProofStepCollection.
        @param onErrorSolvingExercise - The callback function that is called if there is a problem solving the exercise.
     */
  this.solve = function (exercise, onExerciseSolved, onErrorSolvingExercise) {
    const currentStep = exercise.steps.getCurrentStep()
    let currentStrategy
    let currentFormula
    let state

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

    if (currentStep === null) {
      currentFormula = exercise.formula
      currentStrategy = '[]'
    } else {
      currentFormula = currentStep.formula
      currentStrategy = currentStep.strategyStatus
    }

    state = [exercise.type, currentStrategy, currentFormula, '']

    IdeasServiceProxy.derivation(state, onSuccess, onError)
  }

  /**
        Solves the next step of a one way exercise.
        @param {OneWayExercise} exercise - the exercise of which the next step must be solved.
        @param onNextStepSolved - The callback function that is called after the next step is solved.
        The callback function expects 1 parameter, a OneWayStep.
        @param onErrorSolvingNextStep - The callback function that is called if there is a problem solving the next step.
     */
  this.solveNextStep = function (exercise, onNextStepSolved, onErrorSolvingNextStep) {
    const currentStep = exercise.steps.getCurrentStep()
    let state
    let currentStrategy
    let currentFormula
    const onError = onErrorSolvingNextStep
    const onSuccess = function (data) {
      if (data === null || data.error !== null || data.result === null) {
        if (data.error.search(/No step/i) >= 0) {
          onErrorSolvingNextStep('no-step-possible')
        } else {
          onErrorSolvingNextStep('error-solving-next-step')
        }
        return
      }

      if (data.result.length === 0) {
        onErrorSolvingNextStep('error-solving-last-step')
        return
      }
      const result = data.result
      const nextStep = new OneWayStep(result[3][2], result[0])
      if (nextStep) {
        onNextStepSolved(nextStep)
      }
    }

    if (currentStep === null) {
      currentFormula = exercise.formula
      currentStrategy = '[]'
    } else {
      currentFormula = currentStep.formula
      currentStrategy = currentStep.strategyStatus
    }
    state = [exercise.type, currentStrategy, currentFormula, '']

    IdeasServiceProxy.onefirst(state, 'nextStep', onSuccess, onError)
  }

  /**
        Solves the next step of a one way exercise.
        @param {OneWayExercise} exercise - the exercise of which the next step must be solved.
        @param onNextStepSolved - The callback function that is called after the next step is solved.
        The callback function expects 1 parameter, a OneWayStep.
        @param onErrorSolvingNextStep - The callback function that is called if there is a problem solving the next step.

    this.solveNextStep = function (exercise, onNextStepSolved, onErrorSolvingNextStep) {
        var currentStep = exercise.steps.getCurrentStep(),
            state,
            currentStrategy,
            currentFormula,
            onError = onErrorSolvingNextStep,
            onSuccess = function (data) {
                if (data === null || data.error !== null || data.result === null) {
                    onErrorSolvingNextStep("error-solving-next-step");
                    return;
                }

                if (data.result.length === 0) {
                    onErrorSolvingNextStep("error-solving-last-step");
                    return;
                }

                var nextStep = null;
                jQuery.each(data.result, function () {
                    nextStep = new OneWayStep(this[2], this[0]);
                    // controleren of het een valide step is
                    if (Rules[nextStep.rule] === null) {
                        // overslaan, naar de volgende stap
                        return true;
                    }
                    return false;
                });

                if (data.result.length === 1) {
                    nextStep.isReady = true;
                }

                if (nextStep) {
                    onNextStepSolved(nextStep);
                }
            };

        if (currentStep === null) {
            currentFormula = exercise.formula;
            currentStrategy = "[]";
        } else {
            currentFormula = currentStep.formula;
            currentStrategy = currentStep.strategyStatus;
        }
        state = [exercise.type, currentStrategy, currentFormula, ""];

        IdeasServiceProxy.derivation(state, onSuccess, onError);
    }; */

  /**
        Gets the help for the next step of a one way exercise.
        @param {OneWayExercise} exercise - The exercise of which the hint for the next step must be given.
        @param onHelpForNextStepFound - The callback function that is called after the help for the next step is found.
        The callback function expects 1 parameter, a OneWayStep.
        @param onErrorGettingHelpForNextStep - The callback function that is called if there is a problem getting help for the next step.
     */
  this.getHelpForNextStep = function (exercise, onHelpForNextStepFound, onErrorGettingHelpForNextStep) {
    const currentStep = exercise.steps.getCurrentStep()
    let currentStrategy
    let currentFormula
    let state
    const onError = onErrorGettingHelpForNextStep
    const onSuccess = function (data) {
      if (data === null || data.error !== null || data.result === null) {
        if (data.error.search(/No step/i) >= 0) {
          onErrorGettingHelpForNextStep('no-step-possible')
        } else {
          onErrorGettingHelpForNextStep('error-showing-hint')
        }
      } else {
        const onewaySteps = new OneWayStepCollection(new OneWayStep(currentStep.formula, null))
        onewaySteps.push(new OneWayStep(data.result[3][2], data.result[0]))
        onHelpForNextStepFound(onewaySteps.getCurrentStep())
      }
    }
    if (currentStep === null) {
      currentFormula = exercise.formula
      currentStrategy = '[]'
    } else {
      currentFormula = currentStep.formula
      currentStrategy = currentStep.strategyStatus
    }

    state = [exercise.type, currentStrategy, currentFormula, '']
    IdeasServiceProxy.onefirst(state, 'Hint: useRule', onSuccess, onError)
  }
}
