/* global LogEXSession, TwoWayStepCollection, TwoWayStep, jQuery, IdeasServiceProxy, Rules */

import { IdeasServiceProxy } from '../ideasServiceProxy.js'
import { TwoWayStepCollection } from './stepCollection.js'
import { TwoWayStep } from './step.js'

/**
    TwoWayExerciseSolver is responsible for solving exercises.
    @constructor
 */
export function TwoWayExerciseSolver () {
  'use strict'

  /**
        Solves a two way exercise.
        @param exercise - The exercise to be solved
        @param onExerciseSolved - The callback function that is called after the exercise is solved.
        The callback function expects 1 parameter, a ProofStepCollection.
        @param onErrorSolvingExercise - The callback function that is called if there is a problem solving the exercise.
     */
  this.solve = function (exercise, onExerciseSolved, onErrorSolvingExercise) {
    let state
    const currentStep = exercise.steps.getCurrentStep()
    let currentStrategy
    let currentLocation
    let currentFormula

    const onError = onErrorSolvingExercise

    const onSuccess = function (data) {
      if (data === null || data.error !== null || data.result === null || data.result[0][1] === undefined) {
        onErrorSolvingExercise(data.error)
        return
      }

      const proofSteps = new TwoWayStepCollection(new TwoWayStep(exercise.equation.getText(), null))
      jQuery.each(data.result, function () {
        proofSteps.push(new TwoWayStep(this[1], this[0]))
      })
      onExerciseSolved(proofSteps)
    }

    if (currentStep === null) { // hier zouden we nooit mnoeten komen
      currentFormula = currentStep.equation.getText()
      currentStrategy = '[]'
      currentLocation = ''
    } else {
      currentFormula = currentStep.equation.getText()
      currentStrategy = currentStep.strategyStatus
      currentLocation = currentStep.strategyLocation
    }

    state = [exercise.type, currentStrategy, currentFormula, currentLocation]

    IdeasServiceProxy.derivationtext(state, onSuccess, onError)
  }

  /**
        Solves the next step of an exercise.
        @param {Exercise} exercise  - The function of which the next step has to be solved.
        @param onNextStepSolved - The callback function that is called after the next step is solved.
        @param onErrorSolvingNextStep - The callback function that is called if there is a problem solving the next step.
   */

  this.solveNextStep = function (exercise, onNextStepSolved, onErrorSolvingNextStep) {
    const currentStep = exercise.steps.getCurrentStep()
    let state
    let currentStrategy
    let currentLocation
    let currentFormula
    const onError = onErrorSolvingNextStep
    const onSuccess = function (data) {
      if (data === null || data.error !== null || data.result === null) {
        onErrorSolvingNextStep('error-solving-next-step')
        return
      }

      if (data.result.length === 0) {
        onErrorSolvingNextStep('error-solving-last-step')
        return
      }
      const result = data.result
      const nextStep = new TwoWayStep(result[3][2], result[0])
      nextStep.strategyStatus = result[3][1]
      nextStep.strategyLocation = { location: result[1] } // Add the location (subterm in focus)
      if (nextStep) {
        onNextStepSolved(nextStep)
      }
    }

    if (currentStep === null) {
      currentFormula = currentStep.equation.getText()
      currentStrategy = '[]'
      currentLocation = ''
    } else {
      currentFormula = currentStep.equation.getText()
      currentStrategy = currentStep.strategyStatus
      currentLocation = currentStep.strategyLocation
    }
    state = [exercise.type, currentStrategy, currentFormula, currentLocation]

    IdeasServiceProxy.onefirst(state, 'nextStep', onSuccess, onError)
  }

  /**
        Solves the next step of an exercise.
        @param {Exercise} exercise  - The function of which the next step has to be solved.
        @param onNextStepSolved - The callback function that is called after the next step is solved.
        The callback function expects 1 parameter, a ProofStep.
        @param onErrorSolvingNextStep - The callback function that is called if there is a problem solving the next step.

    this.solveNextStep = function (exercise, onNextStepSolved, onErrorSolvingNextStep) {
        var currentStep = exercise.steps.getCurrentStep(),
            nextStep = null,
            currentStrategy,
            currentFormula,
            state,

            onError = onErrorSolvingNextStep,
            onSuccess = function (data) {

      if (data === null || data.error !== null || data.result === null) {
                    onErrorSolvingNextStep();
                    return;
                }

                jQuery.each(data.result, function () {
                    nextStep = new TwoWayStep(this[2], this[0]);

                    // controleren of het een valide step is
                    if (Rules[nextStep.rule] === null) {
                        // overslaan, naar de volgende stap
                        return true;
                    }
                    return false;
                });

                if (nextStep === null) {
                    nextStep = new TwoWayStep("", "");
                    nextStep.isReady = true;
                } else {
                    if (data.result.length === 1) {
                        nextStep.isReady = true;
                    }
                }

                if (nextStep) {
                    onNextStepSolved(nextStep);
                }

      };

        if (currentStep === null) {// hier zouden we nooit moeten komen
            currentFormula = currentStep.equation.getText();
            currentStrategy = "[]";
        } else {
            currentFormula = currentStep.equation.getText();
            currentStrategy = currentStep.strategyStatus;
        }

        state = [exercise.type, currentStrategy, currentFormula, ""];

        IdeasServiceProxy.derivation(state, onSuccess, onError);
    }; */

  /**
        Gets the help for the next step of an exercise.
        @param {Exercise} exercise - The exercise of which the help for the next step is needed.
        @param onHelpForNextStepFound - The callback function that is called after the help for the next step is found.
        The callback function expects 1 parameter, a ProofStep.
        @param onErrorGettingHelpForNextStep - The callback function that is called if there is a problem getting help for the next step.
     */
  this.getHelpForNextStep = function (exercise, onHelpForNextStepFound, onErrorGettingHelpForNextStep) {
    const currentStep = exercise.steps.getCurrentStep()
    let currentStrategy
    let currentLocation
    let currentFormula
    let state
    const onError = onErrorGettingHelpForNextStep
    const onSuccess = function (data) {
      if (data === null || data.error !== null || data.result === null) {
        onErrorGettingHelpForNextStep()
      } else {
        const proofSteps = new TwoWayStepCollection(new TwoWayStep(currentStep.equation.getText(), null))
        proofSteps.push(new TwoWayStep(data.result[3][2], data.result[0]))
        onHelpForNextStepFound(proofSteps.getCurrentStep())
      }
    }

    if (currentStep === null) {
      currentFormula = currentStep.equation.getText()
      currentStrategy = '[]'
      currentLocation = ''
    } else {
      currentFormula = currentStep.equation.getText()
      currentStrategy = currentStep.strategyStatus
      currentLocation = currentStep.strategyLocation
    }

    state = [exercise.type, currentStrategy, currentFormula, currentLocation]
    IdeasServiceProxy.onefirst(state, 'Hint: rewriteThis', onSuccess, onError)
  }
}
