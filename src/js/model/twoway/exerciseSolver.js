import { IdeasServiceProxy } from '../ideasServiceProxy.js'
import { ExerciseSolver } from '../shared/exerciseSolver.js'
import { TwoWayStepCollection } from './stepCollection.js'
import { TwoWayStep } from './step.js'
import { Equation } from './equation.js'

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
    const currentTopStep = exercise.steps.topSteps[exercise.steps.topSteps.length - 1]
    const currentBottomStep = exercise.steps.bottomSteps[exercise.steps.bottomSteps.length - 1]

    const currentFormula = `${currentTopStep.formula} == ${currentBottomStep.formula}`

    const state = {
      exerciseid: exercise.type,
      prefix: exercise.prefix,
      context: {
        term: currentFormula,
        environment: {},
        location: []
      }
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
      for (const i in ds) {
        const step = ds[i]
        if (step.context.term.split('==')[0] === steps.topSteps[steps.topSteps.length - 1].formula) { // && equation.formula2 != exercise.steps.bottomSteps[exercise.steps.bottomSteps.length - 1].formula) {
          const nextStep = new this.Step(step.context.term.split('==')[1], step.step.rule, 'bottom')
          steps.pushBottomStep(nextStep)
        } else {
          const nextStep = new this.Step(step.context.term.split('==')[0], step.step.rule, 'top')
          steps.pushTopStep(nextStep)
        }
      }

      onExerciseSolved(steps)
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
      const equation = new Equation(result.state.context.term)
      let nextStep
      if (equation.formula1 === exercise.steps.topSteps[exercise.steps.topSteps.length - 1].formula) { // && equation.formula2 != exercise.steps.bottomSteps[exercise.steps.bottomSteps.length - 1].formula) {
        nextStep = new this.Step(equation.formula2, result.step.rule, 'bottom')
      } else {
        nextStep = new this.Step(equation.formula1, result.step.rule, 'top')
      }
      exercise.prefix = result.state.prefix
      if (nextStep) {
        onNextStepSolved(nextStep)
      }
    }.bind(this)

    const state = this._getState(exercise)

    IdeasServiceProxy.onefirst(this.config, state, 'nextStep', onSuccess, onError)
  }
}
