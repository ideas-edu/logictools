import { IdeasServiceProxy } from '../ideasServiceProxy.js'
import { ExerciseValidator } from '../shared/exerciseValidator.js'
import { LogAxStep } from './step.js'

/**
    LogAxExerciseValidator is responsible for validating one way exercises.
    @constructor
 */
export class LogAxExerciseValidator extends ExerciseValidator {
  getState (exercise) {
    const state = {
      exerciseid: exercise.type,
      prefix: exercise.prefix,
      context: {
        term: exercise.getObject(),
        environment: {},
        location: []
      }
    }

    return state
  }

  getContext (exercise, step2) {
    const context = {
      term: step2.formula,
      environment: {},
      location: []
    }

    return context
  }

  validateApply (exercise, step, onValidated, onErrorValidating) {
    const state = this.getState(exercise)

    const validated = function (response) {
      if (response.apply.diagnosetype === 'incorrect') {
        const baseRuleKey = step.rule.split('.')[3]
        const ruleKey = `rule.logic.propositional.axiomatic.${baseRuleKey}`
        onErrorValidating({ key: 'shared.error.cannotApply', params: { rule: ruleKey } })
        return
      }

      if (response.apply.diagnosetype === 'buggy') {
        const key = response.apply.rule.substring(20) // Remove 'logic.propositional.'

        const params = {}
        for (const [key, value] of Object.entries(response.apply.environment)) {
          params[key] = LogAxStep.convertToLatex(value)
        }

        onErrorValidating({
          key: `buggyRule.${key}`,
          params: params
        })
        return
      }

      if (!response.apply) {
        onErrorValidating()
        return
      }
      exercise.prefix = response.apply.state.prefix
      onValidated(response.apply.state.context.term.proof)
    }
    if (step.requestInfo === undefined) {
      step.requestInfo = ''
    }
    IdeasServiceProxy.apply(this.config, state, step.environment, [], step.rule, step.requestInfo, validated, onErrorValidating)
  }

  isFinished (exercise, onFinished, onError) {
    const state = this.getState(exercise)

    const validated = function (response) {
      if (!response.finished) {
        onError()
        return
      }

      onFinished(response.finished)
    }
    IdeasServiceProxy.finished(this.config, state, validated, onError)
  }
}
