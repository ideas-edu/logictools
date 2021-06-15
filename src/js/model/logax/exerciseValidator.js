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
      prefix: '[]',
      context: {
        term: exercise.steps.getObject(),
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
      if (response.error) {
        if (response.error.slice(0, 12) === 'Cannot apply') { // syntax error
          const baseRuleKey = step.rule.split('.')[3]
          const ruleKey = `rule.logic.propositional.axiomatic.${baseRuleKey}`
          onErrorValidating({ key: 'shared.error.cannotApply', params: { rule: ruleKey } })
          return
        }
        const BUGGY_RULE_PATTERN = /Buggy rule logic\.propositional\.([a-zA-Z0-9\-_.]+)( {(.*)})?/
        const key = response.error.split('+')[0] // when more than 1 error take the first

        const match = BUGGY_RULE_PATTERN.exec(key)
        let params = null
        if (match !== null) {
          if (match[3]) {
            const ps = match[3].split(',')
            params = {}
            for (let i = 0; i < ps.length; i++) {
              const p = ps[i].trim()
              if (p.indexOf('=') === -1) { // belongs to previous param
                params[params.length - 1][1] += ', ' + p
              } else {
                const ss = p.split('=')
                params[ss[0]] = LogAxStep.convertToLatex(ss[1])
              }
            }
          }

          onErrorValidating({
            key: `buggyRule.${match[1]}`,
            params: params
          })
          return
        }
      }

      if (!response.apply) {
        onErrorValidating()
        return
      }
      exercise.steps.newSet(response.apply.state.context.term)
      onValidated()
    }
    IdeasServiceProxy.apply(this.config, state, step.environment, [], step.rule, validated, onErrorValidating)
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
