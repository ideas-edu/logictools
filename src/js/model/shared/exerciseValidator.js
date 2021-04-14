import { IdeasServiceProxy } from '../ideasServiceProxy.js'

/**
    ExerciseValidator is an abstract class for validators
    @constructor
 */
export class ExerciseValidator {
  /**
        Validates a one way exercise step.
        @param {OneWayExercise} exercise - The exercise to be validated.
        @param onValidated - The callback function that is called after validation. The callback function expects 1 parameter, the exercise.
        @param onErrorValidatingStep - The callback function that is called if there is a problem validating the step.
     */
  validateSteps (exercise, index1, index2, onValidated, onErrorValidatingStep) {
    const checkRule = exercise.usesRuleJustification
    let step1
    let step2 = null
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
          if (index1 < exercise.steps.steps.length) { // de stap wordt vergeleken met de opgave -> sterke kans dat hier een correct getoond wordt.
            // correct: de stap is "logisch" gezien wel juist, maar het is onduidelijk wat er is gedaan.
            if (index1 < exercise.steps.steps.length) { // Regels mogen niet gevalideerd worden of aangepast worden -> tellen niet ter controle tov van de opgave
              step2.isRuleValid = true
            }
            step2.isCorrect = true
            if (!checkRule && index1 < exercise.steps.steps.length) {
              step2.rule = data.diagnose.rule
            }
          }
          break
        case 'expected':
          // expected: er is een stap gemaakt die de strategie ook zou maken; de gebruikte regel is herkend.
          step2.isReady = data.diagnose.ready
          step2.isValid = true
          step2.isRuleValid = true
          if (!checkRule && index1 < exercise.steps.steps.length) {
            step2.rule = data.diagnose.rule
          }
          break
        case 'detour':
          // detour: de stap die gemaakt is is goed en herkend (regelnaam), alleen de strategie zou iets anders doen.
          // goedkeuren dus (want het zou best // een slimme stap kunnen zijn)!
          step2.isReady = data.diagnose.ready
          step2.isValid = true
          if (index1 < exercise.steps.steps.length) { // Regels mogen niet gevalideerd of aangepat worden -> tellen niet ter controle tov de opgave
            step2.isRuleValid = true
          }
          if (!checkRule && index1 < exercise.steps.steps.length) {
            step2.rule = data.diagnose.rule
          }
          break
        case 'similar':
          // Exception for associativity, the step is structurally identical but user explicitly uses associativity
          if (data.diagnose.rule === 'logic.propositional.assoc') {
            if (index1 < exercise.steps.steps.length) { // Regels mogen niet gevalideerd worden of aangepast worden -> tellen niet ter controle tov van de opgave
              step2.isValid = true
            }
            step2.isCorrect = true
            if (!checkRule && index1 < exercise.steps.steps.length) {
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
          if (step2.rule !== null && step2.rule.indexOf('demorgan') >= 0 && data.diagnose.rule !== null && data.diagnose.rule.indexOf('demorgan') >= 0) {
            step2.isValid = true
            step2.isRuleValid = true
            step2.rule = data.diagnose.rule
          }
          break
      }
      if (index1 < exercise.steps.steps.length - 2) {
        // De overgangen tussen de stappen wordt gecontroleerd.
        index1 += 1
        index2 += 1
        this.validateSteps(exercise, index1, index2, onValidated, onErrorValidatingStep)
      } else {
        // De overgangen tussen de opgave en de stappen worden gecontroleerd.
        if (index1 === exercise.steps.steps.length - 2) {
          // Er zijn nog geen stappen met de opgave gecontroleerd: sentinel = index1 die op het aantal elementen staat.
          index1 = exercise.steps.steps.length
          index2 = 2 // De eertste stap moeten we niet meer vergelijken met de opgave: is al gebeurd in de stappencontrole.
          if (exercise.steps.steps.length === 2) { // Als de oefening uit maar 2 stappen bestaat, moet er niet meer gecontroleerd worden.
            onValidated(exercise)
          } else {
            this.validateSteps(exercise, index1, index2, onValidated, onErrorValidatingStep)
          }
        } else {
          if (index2 < exercise.steps.steps.length - 1) {
            index2 += 1
            this.validateSteps(exercise, index1, index2, onValidated, onErrorValidatingStep)
          } else {
            onValidated(exercise)
          }
        }
      }
    }
    step2 = exercise.steps.steps[index2]
    if (index1 === exercise.steps.steps.length) {
      // als index1 = de lengte van de array van stappen -> de verschillende stappen worden vergeleken met de opgave.
      // de te vergelijken stap is dus steeds de opgave + de status van de stappen mag niet gewijzigd meer worden.
      step1 = exercise.steps.steps[0]
    } else {
      step1 = exercise.steps.steps[index1]
      this.initializeStepStatus(step2)
    }

    const state = this.getState(exercise, step1)
    const context = this.getContext(exercise, step2)

    if (checkRule && index1 < exercise.steps.steps.length - 1) { // Er moet regelvalidatie plaatsvinden -> rule wordt meegegeven als parameter in de params-array
      rule = step2.rule
    }

    IdeasServiceProxy.diagnose(state, context, rule, onSuccess, onError)
  }

  validateExercise (exercise, stepIndex1, stepIndex2, onValidated, onErrorValidatingExercise) {
    const index1 = Math.max(stepIndex1, 0) // Eerste index van de te controleren stap is 1 (indien < 1, tel eentje bij: heeft geen nut om stap 0 (=opgave) te controleren
    const index2 = Math.max(stepIndex2, 1)
    const steps = exercise.steps.steps

    if (exercise.steps.steps.length > 1) {
      // controleer alle stappen recursief
      if (index1 < steps.length - 1) {
        // er moet nog een overgang gecontroleerd worden
        this.validateSteps(exercise, index1, index2, onValidated, onErrorValidatingExercise)
      } else {
        // Alle overgangen tussen twee stappen zijn gecontroleerd
        if (index2 < steps.length - 1) {
          this.validateSteps(exercise, index1, index2, onValidated, onErrorValidatingExercise)
        } else {
          // er zijn geen stappen (meer) te controleren
          this.validateSteps(exercise, index1, index2, onValidated, onErrorValidatingExercise)
        }
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
  validateStep (exercise, checkRule, step1, step2, onValidated, onErrorValidatingStep) {
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
          if (!checkRule) {
            step2.rule = data.diagnose.rule
          }
          break
        case 'expected':
          // expected: er is een stap gemaakt die de strategie ook zou maken; de gebruikte regel is herkend.
          step2.isReady = data.diagnose.ready
          step2.isValid = true
          step2.isRuleValid = true
          if (!checkRule) {
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
          if (!checkRule) {
            step2.rule = data.diagnose.rule
          }
          break
        case 'similar':
          // Exception for associativity, the step is structurally identical but user explicitly uses associativity
          if (data.diagnose.rule === 'logic.propositional.assoc') {
            step2.isValid = true
            step2.isCorrect = true
            if (!checkRule) {
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
    if (checkRule) { // Er moet regelvalidatie plaatsvinden -> rule wordt meegegeven als parameter in de params-array
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
