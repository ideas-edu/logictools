import $ from 'jquery'
import jsrender from 'jsrender'
import 'bootstrap'
import 'iframe-resizer'
import 'bootstrap/dist/css/bootstrap.min.css'
import '@fortawesome/fontawesome-free/js/fontawesome'
import '@fortawesome/fontawesome-free/js/solid'
import '@fortawesome/fontawesome-free/js/regular'
import '@fortawesome/fontawesome-free/js/brands'
import 'katex/dist/katex.min.css'
import katex from 'katex'

import { FormulaPopover } from '../../shared/kbinput/kbinput.js'

import { LogExController } from './LogExController.js'
import { config } from '../config.js'
import { LogEXSession } from '../logEXSession.js'
import { Resources } from '../resources.js'
import { OneWayExerciseGenerator } from '../model/oneway/exerciseGenerator.js'
import { OneWayExerciseSolver } from '../model/oneway/exerciseSolver.js'
import { OneWayExerciseValidator } from '../model/oneway/exerciseValidator.js'
import { OneWayStep } from '../model/oneway/step.js'
import { OneWayExercise } from '../model/oneway/exercise.js'
import { SyntaxValidator } from '../model/syntaxValidator.js'
import { Rules } from '../model/rules.js'
import { IdeasServiceProxy } from '../model/ideasServiceProxy.js'
import { showdiff } from '../showdiff.js'
// import { translateInstance } from '../translate.js'
import { translate, loadLanguage } from '../translate.js'

jsrender($); // load JsRender jQuery plugin methods

(function () {
  $(document).ready(function () {
    const controller = new OneWayController()
    controller.getExerciseType()
    controller.initializeRuleJustification()
    controller.initializeStepValidation()
    controller.initializeButtons()
    controller.initializeInput()
    controller.setExampleExercises()
    controller.initializeLabels()
    controller.initializeRules($('#rule'))
    controller.bindExampleExercises()
  })
})()

function updateTexts () {
  document.getElementById('ok').innerHTML = translate('send', { name: 'Bob', name2: 'Joe' })
  document.getElementById('show-next-step').innerHTML = translate('nested.key')
  document.getElementById('showderivation').innerHTML = translate('nested.key.not.found')
}

function UITranslate (exerciseType) {
  const language = LogEXSession.getLanguage()
  const exampleExercises = config.exampleExercises[exerciseType]
  $('#button-' + language).addClass('active')

  $('#validate-step').html("<i class='fas fa-check'></i>")
  $('#show-next-step').html(Resources.getText(language, 'step'))
  $('#solve-exercise').html(Resources.getText(language, 'showderivation'))
  $('#validate-exercise').html(Resources.getText(language, 'derivationdone'))
  $('#newexercise').html("<i class='fas fa-refresh'></i> " + Resources.getText(language, 'newexercise'))
  $('#generate-exercise-easy').html(Resources.getText(language, 'exeasy'))
  $('#generate-exercise-normal').html(Resources.getText(language, 'exnormal'))
  $('#generate-exercise-difficult').html(Resources.getText(language, 'exhard'))
  $('#new-exercise').html(Resources.getText(language, 'new-exercise'))

  // Translate the example exercises
  for (let i = 0; i < exampleExercises.length; i++) {
    const nr = exampleExercises[i] + 1
    const id = 'exercise' + nr
    $('#' + id).html(Resources.getText(language, 'exercise') + ' ' + nr)
  }

  $('#help').html("<i class='fas fa-question-circle'></i> " + Resources.getText(language, 'help'))
  $('#help').attr('href', 'LogEQ_manual_' + language + '.pdf').attr('target', '_new')
  $('#logout').html("<i class='fas fa-signout'></i> " + Resources.getText(language, 'logout'))
  if ($('#create-exercise-button-content') !== null) {
    $('#create-exercise-button-content').html("<i class='fas fa-check'></i> " + Resources.getText(language, 'create-exercise-button'))
  }
  const langCallback = updateTexts
  loadLanguage(language, langCallback)
}
window.UITranslate = UITranslate

/**
    OneWayController is responsible for handling all user interaction and manipulation of the user interface.
    @constructor
 */

class OneWayController extends LogExController {
  constructor () {
    super()
    this.exerciseGenerator = new OneWayExerciseGenerator()
    this.exerciseSolver = new OneWayExerciseSolver()
    // validation
    this.exerciseValidator = new OneWayExerciseValidator()
    this.syntaxValidator = new SyntaxValidator()

    document.getElementById('validate-step').addEventListener('click', function () {
      this.validateStep()
    }.bind(this))

    $('body').on('click', 'button.remove-top-step', function () {
      $('#formula').popover('dispose')
      this.removeTopStep($(this))
    })

    $('body').on('focusout', '.retryFormula', function () {
      this.retryFormula($(this))
    })

    $('body').on('focusout', '.retryRule', function () {
      $('#formula').popover('hide')
      this.retryRule($(this))
    })

    $('body').on('focus', '.retryRule', function () {
      $('#formula').popover('hide')
      $('.retryFormula').popover('hide')
      this.retryRule($(this))
    })

    document.getElementById('rule').addEventListener('change', function () {
      $('#formula').popover('hide')
      $('.retryFormula').popover('hide')
      this.clearErrors()
    }.bind(this))

    $('body').on('focus', '#formula', function () {
      $('#formula').popover('hide')
      $('.retryFormula').popover('hide')
    })

    $('body').on('focus', '.retryFormula', function () {
      $('#formula').popover('hide')
    })

    $('#formula').bind('paste cut', function () {
      setTimeout(function () {
        // $('#formula').kbinput('tidy')
        $('#equivsign').attr('src', 'img/equivsignok.png')
        $('#formula').removeClass('error')
        $('#formula').tooltip('dispose')
      }, 100)
    })
  }

  /**
        Creates the popover for the input of symbols
    */
  initializeInput () {
    const formulaOptions = {
      id: 1,
      characters: this.characterOptions
    }
    this.formulaPopover = new FormulaPopover(document.getElementById('formula'), document.getElementById('one-way-input'), formulaOptions)
  }

  /**
        Initializes all buttons and label to correct language
     */
  initializeLabels () {
    UITranslate(this.exerciseType)
  }

  /**
        Initializes drop down box for rules from Rules dictionary
     */
  initializeRules (comboRule) {
    const language = LogEXSession.getLanguage()
    let previousRule = 'START' // For unification of the Rules list
    let rule

    // Clear ruleset if already set
    comboRule.find('option').remove().end()

    for (rule in Rules) {
      // Rule will only be displayed if it has not already been displayed
      if (Object.prototype.hasOwnProperty.call(Rules, rule) && Resources.getRule(language, rule) !== previousRule) {
        $('<option/>').val(rule).html(Resources.getRule(language, rule)).appendTo(comboRule)
        previousRule = Resources.getRule(language, rule)
      }
    }
  }

  /**
        Gets the html code for an combobox to be used in the rendered step
    */
  renderRuleCombobox (selectedRule) {
    const language = LogEXSession.getLanguage()
    let previousRule = 'START'
    let rule
    let ruleTranslation
    let renderedCombobox = ''

    for (rule in Rules) {
      ruleTranslation = Resources.getRule(language, rule)
      if (previousRule !== ruleTranslation) {
        renderedCombobox += ("<option value='" + rule + "'")
        if (rule === selectedRule) {
          renderedCombobox += ' selected'
        }
        renderedCombobox += '>' + ruleTranslation + '</option>'
        previousRule = ruleTranslation
      }
    }
    return renderedCombobox
  }

  /**
        Resets the UI to its original state.
     */
  reset () {
    this.clearErrors()
    $('#formula').popover('dispose')
    $('#formula').blur()
    // $('#formula').val('')
    $('#exercise').hide()
    $('#exercise-left-formula').html('')
    $('#exercise-right-formula').html('')
    $('.exercise-step-added').remove()
    $('#exercise-steps div.exercise-step-added-bottom').remove()
    $('#exercise-steps div.exercise-step-added-top').remove()
    $('#exercise-steps div.last-step').remove()

    if ($('#new-exercise-content')) {
      $('#new-exercise-content').remove()
    }
  }

  disableUI (disable) {
    $(':input').attr('disabled', disable)

    document.getElementById('wait-exercise').style.display = disable ? '' : 'none'
  }

  /**
        Get an example exercise.
     */

  useExercise (exnr) {
    const properties = {
      ruleJustification: document.getElementById('rule-switch').checked,
      stepValidation: document.getElementById('step-validation-switch').checked
    }

    document.getElementById('generate-exercise').innerHTML = 'Opgave ' + (exnr + 1)

    super.useExercise(exnr, properties)
  }

  /**
        Generates an exercise.
     */
  generateExercise () {
    const properties = {
      ruleJustification: document.getElementById('rule-switch').checked,
      stepValidation: document.getElementById('step-validation-switch').checked
    }

    super.generateExercise(properties)
  }

  /**
        Shows the form for creating a new exercise
     */
  newExercise () {
    const newExerciseTemplate = $('#new-exercise-template')
    const newExerciseHtml = newExerciseTemplate.render()

    this.reset()
    $('#bottom').hide()
    $('#exercise-steps').hide()
    $(newExerciseHtml).insertBefore('#exercise-steps')
    $('#create-exercise-button-content').html("<i class='fas fa-check'></i> " + Resources.getText(LogEXSession.getLanguage(), 'create-exercise-button'))
    $('#formula').focus()

    $('#create-exercise-button').click(function () {
      this.createExercise()
    }.bind(this))

    $('#formula').bind('paste cut', function () {
      setTimeout(function () {
        // $('#formula').kbinput('tidy')
        $('#equivsign').attr('src', 'img/equivsignok.png')
        $('#formula').removeClass('error')
        $('#formula').tooltip('dispose')
      }, 100)
    })

    const language = LogEXSession.getLanguage()
    $('#newexercise').html(Resources.getText(language, 'newexercise'))
    $('#create-exercise-button-content').html("<i class='fas fa-check'></i> " + Resources.getText(LogEXSession.getLanguage(), 'create-exercise-button'))
  }

  /**
        Creates a new exercise
     */

  createExercise () {
    const exerciseMethod = Resources.getExerciseMethod(this.exerciseType)
    const properties = {
      ruleJustification: document.getElementById('rule-switch').checked,
      stepValidation: document.getElementById('step-validation-switch').checked
    }

    this.disableUI(true)
    LogEXSession.setDifficulty('normal')
    this.exercise = new OneWayExercise($('#formula').val(), exerciseMethod, properties)
    this.exerciseGenerator.create(exerciseMethod, $('#formula').val(), properties, this.showExercise.bind(this), this.onErrorCreatingExercise.bind(this))
  }

  /**
        Handles the error that an exercise can not be created
     */
  onErrorCreatingExercise () {
    this.disableUI(false)
    this.setErrorLocation('formula')
    this.updateAlert(Resources.getSpecificMessage(LogEXSession.getLanguage(), 'error-creating-exercise'), 'error')
  }

  /**
    */
  showExercise () {
    this.clearErrors()

    // Remove old rows
    const exerciseStepTable = document.getElementById('exercise-step-table')
    let stepRow = exerciseStepTable.firstElementChild
    while (true) {
      if (stepRow.classList.contains('exercise-step')) {
        exerciseStepTable.removeChild(stepRow)
        stepRow = exerciseStepTable.firstElementChild
      } else {
        break
      }
    }

    document.getElementById('remove-step-header').style.display = ''

    // Insert first row
    this.insertStep(this.exercise.steps.steps[0], false)

    document.getElementById('instruction').innerHTML = 'Reduceer ' + this.exercise.formulaKatex + ' tot disjunctieve normaalvorm'
    document.getElementById('active-step').style.display = ''

    $('#exercise-steps').show()
    if ($('#new-exercise-content')) {
      $('#new-exercise-content').remove()
    }

    $('#formula').val(this.exercise.formula)
    // $('#formula').kbinput('setPreviousValue', $('#formula').val())
    $('#formulaoriginal').val($('#formula').val())

    this.disableUI(false)
    // $('#active-step').show()
    // $('#exercise').show()
    // $('#exercise-steps').show()
    // $('#equivsign').show()
    // $('#validate-step').show()
    // $('#formula').show()

    if (config.displayDerivationButton) {
      $('#solve-exercise').show()
    }
    $('#validate-exercise').show()
    $('#exercise-right-formula').show()
    $('#bottom').show()
    $('#equivsign').attr('src', 'img/equivsignok.png')

    // When using hotkeys focus on formula field must be reset
    if ((LogEXSession.getStudentId() > 0)) {
      $('#formula').blur()
      $('#formula').focus()
    }

    // Reset rule value at start
    $('#rule').val('')

    // doh: zorg dat regelverantwoording niet undefined kan zijn
    // this.exercise.usesRuleJustification = $('#rule-switch').bootstrapSwitch('state')

    // rvl: Check if rule justification is needed
    if (this.exercise.usesRuleJustification) {
      $('#rule').show()
    } else {
      $('#rule').hide()
    }

    document.getElementById('step-validation-switch').disabled = false // $('#step-validation-switch').bootstrapSwitch('disabled', true) // true || false
  }

  /**
        Handles the event that an exercise is generated
     */
  onExerciseGenerated (exercise) {
    this.exercise = exercise
    this.showExercise()
  }

  /**
        Handles the error that an exercise can not generated
     */
  onErrorGeneratingExercise () {
    this.disableUI(false)
    this.setErrorLocation('new-exercise-dropdown')
    this.updateAlert(Resources.getSpecificMessage(LogEXSession.getLanguage(), 'error-generating-exercise'), 'error')
  }

  showSolution () {
    window.open('onewaysolution.html?formula=' + this.exercise.formula + '&exerciseType=' + this.exercise.type, '_blank', 'location=no,width=1020,height=600,status=no,toolbar=no')
  }

  /**
        Shows the next step
     */
  showNextStep () {
    this.dummyExercise = new OneWayExercise(this.exercise.formula, this.exercise.type, false, false)
    this.dummyExercise.steps.push(new OneWayStep(this.exercise.getCurrentStep().formula, ''))
    this.disableUI(true)
    this.exerciseSolver.solveNextStep(this.exercise, this.onNextStepSolved.bind(this), this.onErrorSolvingNextStep.bind(this))

    /**
        if (!this.exercise.usesStepValidation && this.exercise.steps.steps.length > 1) {
            this.exerciseValidator.validateStep(this.exercise.type, false, this.dummyExercise.getPreviousStep(), this.dummyExercise.getCurrentStep(), this.showNextStepWithoutStepValidation, this.onErrorSolvingNextStep);

        } else {
            this.exerciseSolver.solveNextStep(this.exercise, this.onNextStepSolved, this.onErrorSolvingNextStep);
        } */
  }

  showNextStepWithoutStepValidation () {
    if (this.dummyExercise.getCurrentStep().isValid || this.dummyExercise.getCurrentStep().isCorrect) {
      this.exerciseSolver.solveNextStep(this.exercise, this.onNextStepSolved, this.onErrorSolvingNextStep)
    } else {
      this.disableUI(false)
      this.setErrorLocation('show-next-step')
      this.updateAlert(Resources.getSpecificMessage(LogEXSession.getLanguage(), 'error-solving-next-stap-inv'), 'error')
    }
  }

  /**
        Handles the event thats the next step of an exercise is solved
        @param {ProofStep} nextStep - The next step
     */
  onNextStepSolved (nextStep) {
    // if (nextStep !== null) {
    //    this.exercise.steps.push(nextStep);
    //    if (this.exercise.usesStepValidation) {
    //        this.exerciseValidator.validateStep(this.exercise.type, this.exercise.usesRuleJustification, this.exercise.getPreviousStep(), this.exercise.getCurrentStep(), this.onStepValidated, this.onErrorValidatingStep);
    //    } else {
    //        this.onStepValidated();
    //    }
    // }

    if (nextStep !== null) {
      this.clearErrors() // verwijder alle voorgaande foutmeldingen van het scherm
      document.getElementById('step-validation-switch').disabled = true // $('#step-validation-switch').bootstrapSwitch('disabled', false) // na validatie van minstens 1 stap, mag de gebruiker niet meer de optie hebben om "correctie per stap" te wijzigen

      this.exercise.steps.push(nextStep)
      this.insertStep(nextStep, true)
      this.exercise.isReady = nextStep.isReady
      this.disableUI(false) // UI hier terug enabled, anders worden de popovers verkeerd gepositioneerd.

      // bij auto step is formula nog niet goed gevuld
      $('#formula').val(nextStep.formula)
      // $('#formula').kbinput('setPreviousValue', $('#formula').val())
      $('#formulaoriginal').val($('#formula').val())

      // Bij het gebruik van hotkeys moet de focus van het formula veld worden reset
      $('#formula').blur()
      $('#formula').focus()

      //    Reset rule value after valid step
      $('#rule').val('')
    } else {
      this.disableUI(false) // UI ook hier terug enabled in geval er geen volgende stappen meer zijn.
    }
  }

  /**
        Handles the error that the next step can not be solved
     */
  onErrorSolvingNextStep (error) {
    this.disableUI(false)
    this.setErrorLocation('show-next-step')
    this.updateAlert(Resources.getSpecificMessage(LogEXSession.getLanguage(), error), 'error')
  }

  /**
        Shows the hint
     */
  showHint () {
    this.exerciseSolver.getHelpForNextStep(this.exercise, this.onHelpForNextStepFound.bind(this), this.onErrorGettingHelpForNextStep.bind(this))
  }

  /**
        Handles the event that help for a next step is found
        @param {OneWayStep} nextOneWayStep - The next one way step
     */
  onHelpForNextStepFound (nextOneWayStep) {
    const language = LogEXSession.getLanguage()
    let helpText = Resources.getText(language, 'nohint')

    if (Rules[nextOneWayStep.rule] !== null) {
      helpText = Resources.getUseRuleMessage(language, nextOneWayStep.rule) + '<a href="#" id="toggle-hint1">» ' + Resources.getText(language, 'nexthint') + '</a>'
    }

    this.updateAlert(helpText, 'hint')

    // Set up next hint
    document.getElementById('toggle-hint1').addEventListener('click', function () {
      const formula = document.getElementById('formula')
      const oldFormula = formula.value
      const newFormula = nextOneWayStep.formula
      const helpText = Resources.getFullHintMessage(language, nextOneWayStep.rule, showdiff(true, newFormula, oldFormula)) + ' <button type="button" id="auto-step" class="btn btn-success pull-right">' + Resources.getText(language, 'dostep') + '</button>'
      this.updateAlert(helpText, 'hint')
      document.getElementById('auto-step').addEventListener('click', function () {
        this.showNextStep()
      }.bind(this))

      // Log hint
      const step = this.exercise.getCurrentStep()
      const state = [this.exercise.type, step.strategyStatus, step.formula, '']
      IdeasServiceProxy.log(state, 'Hint: rewriteThisUsing')
    }.bind(this))
  }

  /**
        Handles the error that the next step can not be solved
     */
  onErrorGettingHelpForNextStep (msg) {
    this.setErrorLocation('show-hint')
    this.updateAlert(Resources.getSpecificMessage(LogEXSession.getLanguage(), msg), 'error')
  }

  /**
        Validates a step

     */
  validateStep () {
    if ($('#rule').val() === '' && this.exercise.usesRuleJustification && this.exercise.usesStepValidation) {
      this.setErrorLocation('rule')
      this.updateAlert(Resources.getSpecificMessage(LogEXSession.getLanguage(), 'no-rule'), 'error')
      return false
    }

    if ($('#formulaoriginal').val() === $('#formula').val()) {
      this.setErrorLocation('formula')
      this.updateAlert(Resources.getSpecificMessage(LogEXSession.getLanguage(), 'not-changed'), 'error')
      return false
    }

    this.disableUI(true)
    this.clearErrors()
    this.exercise.steps.push(new OneWayStep($('#formula').val(), $('#rule').val()))
    if (this.exercise.usesStepValidation) {
      this.exerciseValidator.validateStep(this.exercise, this.exercise.usesRuleJustification, this.exercise.getPreviousStep(), this.exercise.getCurrentStep(), this.onStepValidated.bind(this), this.onErrorValidatingStep.bind(this))
    } else {
      this.onStepValidated()
    }
  }

  /**
        Validates an exercise
      */

  validateExercise () {
    if (this.exercise.usesStepValidation) {
      this.checkIfReady()
    } else {
      this.exerciseValidator.validateExercise(this.exercise, 0, 0, this.onExerciseValidated.bind(this), this.onErrorExerciseValidate.bind(this))
    }
  }

  /**
    Check if the exrecise is completed
      */

  checkIfReady () {
    const onError = function (data) {
      alert('Error calling ready service')
    }
    const onSuccess = function (data) {
      if (data.ready) {
        document.getElementById('active-step').style.display = 'none'
        $('#bottom').hide()
        $('#formula').blur()

        const elements = document.getElementsByClassName('remove-step')
        for (const element of elements) {
          element.style.display = 'none'
        }
        document.getElementById('remove-step-header').style.display = 'none'


        const arrow = katex.renderToString('\\Leftrightarrow', {
          throwOnError: false
        })

        const message = this.exercise.formulaKatex + ' ' + arrow + ' ' + this.exercise.getCurrentStep().formulaKatex
        this.updateAlert(message, 'complete')
        this.disableUI(false)
      } else {
        this.setErrorLocation('formula')
        this.updateAlert(Resources.getSpecificMessage(LogEXSession.getLanguage(), 'incomplete1'), 'error')
        this.disableUI(false)
      }
    }
    this.disableUI(true)
    this.exerciseValidator.validateReady(this.exercise, onSuccess.bind(this), onError.bind(this))
  }

  onExerciseValidated () {
    let i = 0
    let isReady = false
    let completelyCorrect = true

    this.reset()
    $.each(this.exercise.steps.steps, function () {
      let rule = ''
      const stepTemplate = $.templates('#exercise-step-template')
      let error = ''

      if (this.rule !== undefined && this.rule !== '') {
        rule = Resources.getRule(LogEXSession.getLanguage(), this.rule)
      }

      if (i > 0 && !this.isValid && completelyCorrect === true) {
        completelyCorrect = false
      }

      if (!this.isValid) {
        error = Resources.getSpecificMessage(LogEXSession.getLanguage(), 'wrongstep')
      } else if (!this.isSyntaxValid) { // Foutieve syntax
        error = Resources.getInvalidFormulaMessage() + ': ' + this.syntaxError
      } else if (this.isSimilar) { // Ongewijzigde formule
        error = Resources.getSpecificMessage(LogEXSession.getLanguage(), 'similar')
      } else if (this.isCorrect) { // Gemaakte stap is juist, maar onduidelijk wat de gebruiker heeft uitgevoerd
        error = Resources.getSpecificMessage(LogEXSession.getLanguage(), 'correctnotval')
      } else if (this.isBuggy) { // Gemaakte stap is foutief, maar de strategie weet wat er fout is gegaan
        error = Resources.getMessageForBuggyRule(LogEXSession.getLanguage(), this.buggyRule)
      } else if (!this.isRuleValid) { // De ingegeven regel is niet correct
        error = Resources.getSpecificMessage(LogEXSession.getLanguage(), 'wrongrule')
      }

      const exerciseStepHtml = stepTemplate.render({
        rule: rule,
        formula: this.formulaKatex,
        canDelete: false,
        isWrong: !this.isValid,
        hasRule: this.rule !== undefined,
        step: i,
        ruleCombobox: this.renderRuleCombobox(this.rule),
        stepValidation: false,
        ruleJustification: this.exercise.usesRuleJustification,
        error: error
      })

      $('#active-step').before(exerciseStepHtml)

      if (this.isReady && !isReady && completelyCorrect === true) {
        isReady = true
        this.insertLastStep(this)
      }

      if (!this.isRuleValid && i > 0) {
        this.initializeRules($('#rule' + i))
      }

      i += 1
    })

    $('#formula').val(this.exercise.getCurrentStep().formula)
    // $('#formula').kbinput('setPreviousValue', $('#formula').val())
    $('#formulaoriginal').val($('#formula').val())

    $('#formula').blur()
    // $('.retryFormula').kbinput('hide')
    this.disableUI(false)

    if (!isReady) {
      this.setErrorLocation('validate-exercise')
      this.updateAlert(Resources.getSpecificMessage(LogEXSession.getLanguage(), 'incomplete'), 'error')
    }
  }

  onErrorExerciseValidate () {
    this.setErrorLocation('validate-step')
    this.updateAlert(Resources.getSpecificMessage(LogEXSession.getLanguage(), 'error-validating-exercise'), 'error')
  }

  /**
        Handles the event that a step is validated

     */
  onStepValidated () {
    const currentStep = this.exercise.getCurrentStep()
    let message
    let errorLocation

    this.clearErrors() // verwijder alle voorgaande foutmeldingen van het scherm
    document.getElementById('step-validation-switch').disabled = true // $('#step-validation-switch').bootstrapSwitch('disabled', false) // na validatie van minstens 1 stap, mag de gebruiker niet meer de optie hebben om "correctie per stap" te wijzigen

    // de stap is niet valid en gebruikt stap validatie
    if (!currentStep.isValid && this.exercise.usesStepValidation) {
      message = Resources.getSpecificMessage(LogEXSession.getLanguage(), 'wrongstep')
      this.exercise.steps.pop()

      if (!currentStep.isSyntaxValid) { // Foutieve syntax
        message = Resources.getInvalidFormulaMessage() // + ": " + currentStep.syntaxError;
        errorLocation = 'formula'
      } else if (currentStep.isSimilar) { // Ongewijzigde formule
        message = Resources.getSpecificMessage(LogEXSession.getLanguage(), 'similar')
        errorLocation = 'formula'
      } else if (currentStep.isCorrect) { // Gemaakte stap is juist, maar onduidelijk wat de gebruiker heeft uitgevoerd
        message = Resources.getSpecificMessage(LogEXSession.getLanguage(), 'correctnotval')
        errorLocation = 'formula'
      } else if (currentStep.isBuggy) { // Gemaakte stap is foutief, maar de strategie weet wat er fout is gegaan
        message = Resources.getMessageForBuggyRule(LogEXSession.getLanguage(), currentStep.buggyRule)
        errorLocation = 'formula'
      } else if (!currentStep.isRuleValid) { // De ingegeven regel is niet correct
        message = Resources.getSpecificMessage(LogEXSession.getLanguage(), 'wrongrule')
        errorLocation = 'rule'
      } else if (!currentStep.isValid) {
        message = Resources.getSpecificMessage(LogEXSession.getLanguage(), 'wrongstep')
        errorLocation = 'formula'
      }

      this.disableUI(false) // disableUI(false) moet opgeroepen worden voordat de errorTooltip getoond wordt, anders wordt de tooltip te laag getoond (= hoogte van het wait-icoontje)
      this.setErrorLocation(errorLocation)
      this.updateAlert(message, 'error')
    } else {
      this.insertStep(currentStep, true)
      this.exercise.isReady = currentStep.isReady

      // bij auto step is formula nog niet goed gevuld
      $('#formula').val(currentStep.formula)
      // $('#formula').kbinput('setPreviousValue', $('#formula').val())
      $('#formulaoriginal').val($('#formula').val())

      this.disableUI(false)

      // Bij het gebruik van hotkeys moet de focus van het formula veld worden reset
      $('#formula').blur()
      $('#formula').focus()

      //    Reset rule value after valid step
      $('#rule').val('')
    }
  }

  /**
        Handles the error that the step can not be validated
     */
  onErrorValidatingStep () {
    this.exercise.steps.pop()
    this.disableUI(false)
    this.setErrorLocation('validate-step')
    this.updateAlert(Resources.getSpecificMessage(LogEXSession.getLanguage(), 'error-validating-step'), 'error')
  }

  /**
        Validates the formulas

        @param onFormulasValidated - The callback function
     */
  validateInput (afterInputValidated) {
    this.clearErrors()
    this.validateFormula($('#formula'), function (isValid, formulaText) {
      this.onInputValidated(isValid, formulaText, afterInputValidated)
    })
  }

  /**
        Handles the event that formula 1 is validated

        @param {Boolean} isValid - True if valid, false otherwise
        @param {String} formulaText - The text of the formula
        @param onFormulasValidated - The callback function
     */
  onInputValidated (isValid, formulaText, afterInputValidated) {
    this.onFormulaValidated(isValid, formulaText)
    afterInputValidated()
  }

  /**
        Handles the event that a formula is validated

        @param {Boolean} isValid - True if the formula is valid, false otherwise
        @param {String} formulaText - The text of the formula
     */
  // this.onFormulaValidated = function (isValid, formulaText) {
  onFormulaValidated (isValid) {
    if (!isValid) {
      this.setErrorLocation('formula')
      this.updateAlert(Resources.getSpecificMessage(LogEXSession.getLanguage(), 'invalidformula'), 'error')
    }
    this.isFormulaValid = isValid
  }

  /**
        Validates the formula

        @param formula - The DOM element that contains the formula
        @param onFormulasValidated - The callback function
     */
  validateFormula (formula, callbackFunc) {
    if (callbackFunc === undefined) {
      callbackFunc = this.onFormulaValidated
    }

    if (this.exercise.usesStepValidation) {
      this.syntaxValidator.validateSyntax(formula.val(), callbackFunc)
    } else {
      callbackFunc(true, formula.val())
    }
  }

  renderStep (step, canDelete) {
    let rule = ''
    let arrow = null
    const stepTemplate = $.templates('#exercise-step-template')

    if (step.rule !== undefined) {
      rule = Resources.getRule(LogEXSession.getLanguage(), step.rule)
    }

    if (step.number > 1) {
      arrow = katex.renderToString('\\Leftrightarrow', {
        throwOnError: false
      })
    }

    const exerciseStepHtml = stepTemplate.render({
      rule: rule,
      formula: step.formulaKatex,
      canDelete: canDelete,
      step: step.number,
      arrow: arrow,
      stepValidation: true,
      ruleJustification: true
    })
    return exerciseStepHtml
  }

  /**
        Inserts the last proof step

        @param {ProofStep} step - The proof step
     */
  insertLastStep (step) {
    const stepTemplate = $('#exercise-last-step-template')
    const exerciseStepHtml = stepTemplate.render({
      leftformula: this.exercise.formula,
      rightformula: step.formulaKatex
    })

    $('#active-step').before(exerciseStepHtml)
    $('#active-step').hide()
    $('#bottom').hide()
    $('#formula').blur()

    document.getElementById('remove-step-header').style.display = 'none'
    const elements = document.getElementsByClassName('remove-step')
    for (const element of elements) {
      element.style.display = 'none'
    }

    this.clearErrors()

    document.getElementById('step-validation-switch').disabled = false // $('#step-validation-switch').bootstrapSwitch('disabled', true) // true || false
  }

  /**
        Removes the top steps, starting at the specified source index

        @param source - The source DOM element
     */
  removeTopStep (source) {
    const parent = source.parents('div.exercise-step-added')
    const allExerciseSteps = $('#exercise-steps div.exercise-step-added')
    const index = allExerciseSteps.index(parent)
    const step = this.exercise.getCurrentStep()
    const state = [this.exercise.type, step.strategyStatus, step.formula, '']

    this.clearErrors()
    this.exercise.steps.removeTopSteps(index)

    allExerciseSteps.slice(index).remove()

    $('#formula').val(this.exercise.getCurrentStep().formula)
    // $('#formula').kbinput('setPreviousValue', $('#formula').val())
    $('#formulaoriginal').val($('#formula').val())

    // Bij het gebruik van hotkeys moet de focus van het formula veld worden reset
    $('#formula').blur()
    $('#formula').focus()

    // Log the use of undo
    IdeasServiceProxy.log(state, 'undo')
  }

  retryFormula (source) {
    const parent = source.parents('div.exercise-step-added')
    const allExerciseSteps = $('#exercise-steps div.exercise-step-added')
    const index = allExerciseSteps.index(parent)

    this.exercise.steps.steps[index].formula = source.val()
  }

  retryRule (source) {
    const parent = source.parents('div.exercise-step-added')
    const allExerciseSteps = $('#exercise-steps div.exercise-step-added')
    const index = allExerciseSteps.index(parent)

    this.exercise.steps.steps[index].rule = source.val()
  }

  /**
        Removes the bottom steps, starting at the specified source index

        @param source - The source DOM element
     */
  removeBottomStep (source) {
    this.clearErrors()
    const parent = source.parents('div.exercise-step-added-bottom')
    const allExerciseSteps = $('#exercise-steps div.exercise-step-added-bottom')
    const index = (allExerciseSteps.length - allExerciseSteps.index(parent) - 1)

    this.exercise.steps.removeBottomSteps(index)
    allExerciseSteps.slice(0, allExerciseSteps.index(parent) + 1).remove()

    $('#formula').val(this.exercise.getCurrentStep().equation.formula)
    // $('#formula').kbinput('setPreviousValue', $('#formula').val())
    $('#formulaoriginal').val($('#formula').val())

    // Bij het gebruik van hotkeys moet de focus van het formula veld worden reset
    $('#formula').blur()
    $('#formula').focus()
  }

  // input manipulatie van invoervelden formula1 en 2

  // user interface bindings
  // $("#lang-NL").click(function () {
  //    LogEXSession.setLanguage("NL");
  //    this.initializeLabels();
  //    this.initializeRules($('#rule'));
  //    $("#button-NL").addClass('active');
  //    $("#button-EN").removeClass('active');
  //    alert("inOnewaycontroller");
  // });

  // $("#lang-EN").click(function () {
  //    LogEXSession.setLanguage("EN");
  //    this.initializeLabels();
  //    this.initializeRules($('#rule'));
  //    $("#button-EN").addClass('active');
  //    $("#button-NL").removeClass('active');
  //    alert("inOneWayController");
  // });
}
