import { ExerciseSolver } from '../shared/exerciseSolver.js'
import { TwoWayStepCollection } from './stepCollection.js'
import { TwoWayStep } from './step.js'

/**
    TwoWayExerciseSolver is responsible for solving Two way exercises.
    @constructor
 */
export class TwoWayExerciseSolver extends ExerciseSolver {
  constructor () {
    super()
    this.Step = TwoWayStep
    this.StepCollection = TwoWayStepCollection
  }

  _getState (exercise) {
    const currentStep = exercise.steps.getCurrentStep()
    let currentStrategy
    let currentFormula
    let currentLocation

    if (currentStep === null) {
      currentFormula = currentStep.equation.getText()
      currentStrategy = '[]'
      currentLocation = ''
    } else {
      currentFormula = currentStep.equation.getText()
      currentStrategy = currentStep.strategyStatus
      currentLocation = currentStep.strategyLocation
    }

    const state = {
      exerciseid: exercise.type,
      prefix: currentStrategy,
      context: {
        term: currentFormula,
        environment: {},
        location: currentLocation
      }
    }

    return state
  }
}
