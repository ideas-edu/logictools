import { IdeasServiceProxy } from '../ideasServiceProxy.js'
import { Rules } from '../rules.js'
/**
    TwoWayExerciseValidator is responsible for validating exercises.
    @constructor
 */
export function TwoWayExerciseValidator () {
  'use strict'

  /**
        Validates a one way exercise step.
        @param {OneWayExercise} exercise - The exercise to be validated.
        @param onValidated - The callback function that is called after validation. The callback function expects 1 parameters, the exercise.
        @param onErrorValidatingStep - The callback function that is called if there is a problem validating the step.
     */
  this.validateSteps = function (exercise, index1, index2, onValidated, onErrorValidatingStep) {
    const self = this
    const checkRule = exercise.usesRuleJustification
    let step1
    let step2 = null
    let rule = null
    const onError = onErrorValidatingStep
    const onSuccess = function (data) {
      if (data === null || data.error !== null || data.result === null) {
        step2.isSyntaxValid = false
      } else if ('syntaxerror' in data.result) {
        // syntaxfout
        step2.isSyntaxValid = false
        step2.syntaxError = data.result.syntaxerror
      } else if ('correct' in data.result) {
        if (index1 < exercise.steps.steps.length) { // de stap wordt vergeleken met de opgave -> sterke kans dat hier een correct getoond wordt.
          // correct: de stap is "logisch" gezien wel juist, maar het is onduidelijk wat er is gedaan.
          if (index1 < exercise.steps.steps.length) { // Regels mogen niet gevalideerd worden of aangepast worden -> tellen niet ter controle tov van de opgave
            step2.isRuleValid = true
          }
          step2.isCorrect = true
          if (!checkRule && index1 < exercise.steps.steps.length) {
            step2.rule = data.result.correct[2]
          }
        }
      } else if ('expected' in data.result) {
        // expected: er is een stap gemaakt die de strategie ook zou maken; de gebruikte regel is herkend.
        step2.isReady = data.result.expected[0].ready
        step2.isValid = true
        step2.isRuleValid = true
        if (!checkRule && index1 < exercise.steps.steps.length) {
          step2.rule = data.result.expected[2]
        }
        step2.strategyStatus = data.result.expected[1][1]
      } else if ('detour' in data.result) {
        // detour: de stap die gemaakt is is goed en herkend (regelnaam), alleen de strategie zou iets anders doen.
        // goedkeuren dus (want het zou best // een slimme stap kunnen zijn)!
        step2.isReady = data.result.detour[0].ready
        step2.isValid = true
        if (index1 < exercise.steps.steps.length) { // Regels mogen niet gevalideerd of aangepat worden -> tellen niet ter controle tov de opgave
          step2.isRuleValid = true
        }
        if (!checkRule && index1 < exercise.steps.steps.length) {
          step2.rule = data.result.detour[3]
        }
      } else if ('similar' in data.result) {
        // similar: er is geen stap gemaakt, de begin- en eindtermen zijn gelijk.
        step2.isSimilar = true
      } else if ('notequiv' in data.result) {
        // notequivalent: er is een fout gemaakt, maar we weten niet wat.
        step2.isRuleValid = true
      } else if ('buggy' in data.result) {
        // buggy: er is een fout gemaakt bij het herschrijven, maar gelukkig hebben we herkend welke veelgemaakte fout dat is.
        step2.isRuleValid = true
        step2.isBuggy = true
        step2.buggyRule = data.result.buggy[1]
      } else if ('wrongrule' in data.result) {
        // wrongrule: de stap die gemaakt is is correct, alleen is de gekozen regel niet correct
        // eigenlijk overbodig: isRuleValid staat al op false.
        // regels in IDEAS worden altijd specifiek meegegeven, in LogEX niet: er is maar 1 demorgan-regel in logex (=eerste value om in de listbox geen dubbels te hebben), er zijn er meerdere in IDEAS. Daarom moeten we hier testen
        if (step2.rule !== null && step2.rule.indexOf('demorgan') >= 0 && data.result.wrongrule[2] !== null && data.result.wrongrule[2].indexOf('demorgan') >= 0) {
          step2.isValid = true
          step2.isRuleValid = true
          step2.isReady = data.result.expected[0].ready
          step2.rule = data.result.wrongrule[2]
        }
      }
      if (index1 < exercise.steps.steps.length - 2) {
        // De overgangen tussen de stappen wordt gecontroleerd.
        index1++
        index2++
        self.validateSteps(exercise, index1, index2, onValidated, onErrorValidatingStep)
      } else {
        // De overgangen tussen de opgave en de stappen worden gecontroleerd.
        if (index1 === exercise.steps.steps.length - 2) {
          // Er zijn nog geen stappen met de opgave gecontroleerd: sentinel = index1 die op het aantal elementen staat.
          index1 = exercise.steps.steps.length
          index2 = 2 // De eertste stap moeten we niet meer vergelijken met de opgave: is al gebeurd in de stappencontrole.
          if (exercise.steps.steps.length === 2) { // Als de oefening uit maar 2 stappen bestaat, moet er niet meer gecontroleerd worden.
            onValidated(exercise)
          } else {
            self.validateSteps(exercise, index1, index2, onValidated, onErrorValidatingStep)
          }
        } else {
          if (index2 < exercise.steps.steps.length - 1) {
            index2++
            self.validateSteps(exercise, index1, index2, onValidated, onErrorValidatingStep)
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
      self.initializeStepStatus(step2)
    }

    const state = [exercise.type, step1.strategyStatus, step1.equation.getText(), step1.strategyLocation]
    const formula = step2.equation.getText()
    if (checkRule && index1 < exercise.steps.steps.length - 1) { // Er moet regelvalidatie plaatsvinden -> rule wordt meegegeven als parameter in de params-array
      rule = step2.rule
    }

    IdeasServiceProxy.diagnose(state, formula, rule, onSuccess, onError)
  }

  this.validateExercise = function (exercise, stepIndex1, stepIndex2, onValidated, onErrorValidatingExercise) {
    const self = this
    const index1 = Math.max(stepIndex1, 0) // Eerste index van de te controleren stap is 1 (indien < 1, tel eentje bij: heeft geen nut om stap 0 (=opgave) te controleren
    const index2 = Math.max(stepIndex2, 1)
    const steps = exercise.steps.steps

    if (exercise.steps.steps.length > 1) {
      // controleer alle stappen recursief
      if (index1 < steps.length - 1) {
        // er moet nog een overgang gecontroleerd worden
        self.validateSteps(exercise, index1, index2, onValidated, onErrorValidatingExercise)
      } else {
        // Alle overgangen tussen twee stappen zijn gecontroleerd
        if (index2 < steps.length - 1) {
          self.validateSteps(exercise, index1, index2, onValidated, onErrorValidatingExercise)
        } else {
          // er zijn geen stappen (meer) te controleren
          self.validateSteps(exercise, index1, index2, onValidated, onErrorValidatingExercise)
        }
      }
    } else {
      onValidated()
    }
  }

  /**
        Validates an exercise step.
        @param {Exercise} exercise - The exercise to be validated.
        @param onValidated - The callback function that is called after validation. The callback function expects 2 parameters, the exerciseType and the Step.
        @param onErrorValidatingStep - The callback function that is called if there is a problem validating the step.
     */
  this.validateStep = function (exerciseType, step1, step2, onValidated, onErrorValidatingStep) {
    const self = this
    const state = [exerciseType, step1.strategyStatus, step1.equation.getText(), step1.strategyLocation]
    const formula = step2.equation.getText()
    let rule = null
    const onError = onErrorValidatingStep

    const onSuccess = function (data) {
      let rule

      if (data === null || data.error !== null || data.result === null) {
        // onErrorValidatingStep();
        step2.isValid = false
        step2.isSyntaxValid = false
      } else if ('syntaxerror' in data.result) {
        // syntaxfout
        step2.isSyntaxValid = false
        step2.syntaxError = data.result.syntaxerror
      } else if ('correct' in data.result) {
        // correct: de stap is "logisch" gezien wel juist, maar het is onduidelijk wat er is gedaan.
        step2.isValid = false

        // step2.isReady = data.result.correct[0].ready;
        step2.isRuleValid = true
        step2.isCorrect = true
      } else if ('expected' in data.result) {
        // expected: er is een stap gemaakt die de strategie ook zou maken; de gebruikte regel is herkend.
        rule = data.result.expected[2]

        // if (Rules[step2.rule][0] === Rules[rule][0]) {
        step2.isValid = true
        step2.isReady = data.result.expected[0].ready
        step2.isRuleValid = true
        step2.strategyStatus = data.result.expected[1][1]

        // }
      } else if ('detour' in data.result) {
        // detour: de stap die gemaakt is is goed en herkend (regelnaam), alleen de strategie zou iets anders doen.
        // goedkeuren dus (want het zou best // een slimme stap kunnen zijn)!
        rule = data.result.detour[3]
        if (Rules[step2.rule][0] === Rules[rule][0]) {
          step2.isValid = true
          step2.isReady = data.result.detour[0].ready
          step2.isRuleValid = true
        }
      } else if ('similar' in data.result) {
        // similar: er is geen stap gemaakt, de begin- en eindtermen zijn gelijk.
        step2.isSimilar = true
      } else if ('notequiv' in data.result) {
        // notequivalent: er is een fout gemaakt, maar we weten niet wat.
        step2.isRuleValid = true
      } else if ('buggy' in data.result) {
        // buggy: er is een fout gemaakt bij het herschrijven, maar gelukkig hebben we herkend welke veelgemaakte fout dat is.
        step2.isRuleValid = true
        step2.isBuggy = true
        step2.buggyRule = data.result.buggy[1]
      } else if ('wrongrule' in data.result) {
        // regels in IDEAS worden altijd specifiek meegegeven, in LogEX niet: er is maar 1 demorgan-regel in logex (=eerste value om in de listbox geen dubbels te hebben), er zijn er meerdere in IDEAS. Daarom moeten we hier testen
        if (data.result.wrongrule[2] === null) {
          step2.isRuleValid = true
          step2.isCorrect = true
        } else if (step2.rule !== null && step2.rule.indexOf('demorgan') >= 0 && data.result.wrongrule[2] !== null && data.result.wrongrule[2].indexOf('demorgan') >= 0) {
          step2.isValid = true
          step2.isRuleValid = true
          step2.isReady = data.result.wrongrule[0].ready
          step2.rule = data.result.wrongrule[2]
        }
      }

      // krijgt parameters omdat in onValidated de step bekend moet zijn
      onValidated(exerciseType, step2)
    }

    self.initializeStepStatus(step2)

    // self.initializeStatus(exercise);

    rule = step2.rule

    IdeasServiceProxy.diagnose(state, formula, rule, onSuccess, onError)
  }

  /**
        Initializes the status of the exercise. All status fields are initialized with false;
        @param {Exercise} exercise - The exercise.

     */
  this.initializeStatus = function (exercise) {
    exercise.isValid = false
    exercise.isReady = false
    exercise.isSyntaxValid = false
    exercise.isBuggy = false
    exercise.isCorrect = false
    exercise.isSimilar = false
    exercise.isRuleValid = false
  }

  this.initializeStepStatus = function (step) {
    step.isReady = false
    step.isValid = false
    step.isSyntaxValid = true
    step.isBuggy = false
    step.isCorrect = false
    step.isSimilar = false
    step.isRuleValid = false
    step.stepsRemaining = 0
  }
}
