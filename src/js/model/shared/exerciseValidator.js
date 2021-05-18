import { IdeasServiceProxy } from '../ideasServiceProxy.js'

/**
    ExerciseValidator is an abstract class for validators
    @constructor
 */
export class ExerciseValidator {
  validateExercise (exercise, onValidated, onErrorValidatingExercise) {
    if (exercise.steps.steps.length > 1) {
      for (let i = 0; i < exercise.steps.steps.length - 1; i++) {
        this.validateStep(exercise, exercise.steps.steps[i], exercise.steps.steps[i + 1], onValidated, onErrorValidatingExercise)
      }
    } else {
      onValidated()
    }
  }

  /**
        Validates a one way exercise step.
        @param {OneWayExercise} exercise - The exercise to be validated.
        @param onValidated - The callback function that is called after validation. The callback function expects 1 parameter, the exercise.
        @param onErrorValidatingStep - The callback function that is called if there is a problem validating the step.
     */
  validateStep (exercise, step1, step2, onValidated, onErrorValidatingStep) {
    let rule = null
    const onError = onErrorValidatingStep
    const onSuccess = function (data) {
      if (data === null || data.error !== undefined) {
        if (data.error.slice(0, 7) === '(line 1') { // syntax error
          step2.isSyntaxValid = false
          onValidated(step2)
          return
        }
        onErrorValidatingStep()
        return
      }
      switch (data.diagnose.diagnosetype) {
        case 'syntaxerror':
          // syntaxfout
          step2.isSyntaxValid = false
          step2.syntaxError = data.result.syntaxerror
          break
        case 'correct':
          // correct: de stap is "logisch" gezien wel juist, maar het is onduidelijk wat er is gedaan.
          step2.isRuleValid = true
          step2.isCorrect = true
          if (!exercise.usesRuleJustification) {
            step2.rule = data.diagnose.rule
          }
          break
        case 'expected':
          // expected: er is een stap gemaakt die de strategie ook zou maken; de gebruikte regel is herkend.
          step2.isReady = data.diagnose.ready
          step2.isValid = true
          step2.isRuleValid = true
          if (!exercise.usesRuleJustification) {
            step2.rule = data.diagnose.rule
          }
          step2.strategyStatus = data.diagnose.state.prefix
          break
        case 'detour':
          // detour: de stap die gemaakt is is goed en herkend (regelnaam), alleen de strategie zou iets anders doen.
          // goedkeuren dus (want het zou best // een slimme stap kunnen zijn)!
          step2.isReady = data.diagnose.ready
          step2.isValid = true
          step2.isRuleValid = true
          if (!exercise.usesRuleJustification) {
            step2.rule = data.diagnose.rule
          }
          break
        case 'similar':
          // Exception for associativity, the step is structurally identical but user explicitly uses associativity
          if (data.diagnose.rule === 'logic.propositional.assoc') {
            step2.isValid = true
            step2.isCorrect = true
            if (!exercise.usesRuleJustification) {
              step2.rule = data.diagnose.rule
            }
          } else {
            // similar: er is geen stap gemaakt, de begin- en eindtermen zijn gelijk.
            step2.isSimilar = true
          }
          break
        case 'notequiv':
          // notequivalent: er is een fout gemaakt, maar we weten niet wat.
          step2.isRuleValid = true
          break
        case 'buggy':
          // buggy: er is een fout gemaakt bij het herschrijven, maar gelukkig hebben we herkend welke veelgemaakte fout dat is.
          step2.isRuleValid = true
          step2.isBuggy = true
          step2.buggyRule = data.diagnose.rule
          break
        case 'wrongrule':
          // wrongrule: de stap die gemaakt is is correct, alleen is de gekozen regel niet correct
          // eigenlijk overbodig: isRuleValid staat al op false.
          // regels in IDEAS worden altijd specifiek meegegeven, in LogEX niet: er is maar 1 demorgan-regel in logex (=eerste value om in de listbox geen dubbels te hebben), er zijn er meerdere in IDEAS. Daarom moeten we hier testen
          if (data.diagnose.rule === null) {
            step2.isRuleValid = true
            step2.isCorrect = true
          } else if (step2.rule !== null && step2.rule.indexOf('demorgan') >= 0 && data.diagnose.rule !== null && data.diagnose.rule.indexOf('demorgan') >= 0) {
            step2.isValid = true
            step2.isRuleValid = true
            step2.rule = data.diagnose.rule
          }
          break
      }
      onValidated(step2)
    }

    this.initializeStepStatus(step2)

    const state = this.getState(exercise, step1, step2)
    const context = this.getContext(exercise, step2)
    if (exercise.usesRuleJustification) { // Er moet regelvalidatie plaatsvinden -> rule wordt meegegeven als parameter in de params-array
      rule = step2.rule
    }
    IdeasServiceProxy.diagnose(state, context, rule, onSuccess, onError)
  }

  validateReady (exercise, onValidated, onErrorValidating) {
    const state = this.getState(exercise, exercise.getCurrentStep())
    IdeasServiceProxy.ready(state, onValidated, onErrorValidating)
  }

  /**
        Initializes the status of the exercise. All status fields are initialized with false;
        @param {Exercise} exercise - The exercise.
     */
  initializeStatus (exercise) {
    exercise.isValid = false
    exercise.isReady = false
    exercise.isSyntaxValid = false
    exercise.isBuggy = false
    exercise.isCorrect = false
    exercise.isSimilar = false
    exercise.isRuleValid = false
  }

  initializeStepStatus (step) {
    step.isReady = false
    step.isValid = false
    step.isSyntaxValid = true
    step.isBuggy = false
    step.isCorrect = false
    step.isSimilar = false
    step.isRuleValid = false
  }
}
