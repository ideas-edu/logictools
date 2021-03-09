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
    if (config.randomExercises) {
      controller.generateExercise()
    } else {
      controller.useExercise(0)
    }
  })
})()

const UITranslator = {
  translate: function (exerciseType) {
    'use strict'
    const language = LogEXSession.getLanguage()
    const exampleExercises = config.exampleExercises[exerciseType]
    $('#button-' + language).addClass('active')

    $('#ok').html("<i class='fas fa-check'></i> " + Resources.getText(language, 'send'))
    $('#show-next-step').html(Resources.getText(language, 'step'))
    $('#showderivation').html("<i class='fas fa-key'> </i> " + Resources.getText(language, 'showderivation'))
    $('#derivationdone').html("<i class='fas fa-check'></i> " + Resources.getText(language, 'derivationdone'))
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

    $('#rule-switch-label').html(Resources.getText(language, 'rulejustification'))
    // $('#rule-switch').bootstrapSwitch('onText', Resources.getText(language, 'on')) // sets the text of the "on" label
    // $('#rule-switch').bootstrapSwitch('offText', Resources.getText(language, 'off')) // sets the text of the "off" label

    $('#step-validation-switch-label').html(Resources.getText(language, 'stepvalidation'))
    // $('#step-validation-switch').bootstrapSwitch('onText', Resources.getText(language, 'on')) // sets the text of the "on" label
    // $('#step-validation-switch').bootstrapSwitch('offText', Resources.getText(language, 'off')) // sets the text of the "off" label
  }
}

/**
    OneWayController is responsible for handling all user interaction and manipulation of the user interface.
    @constructor
 */

class OneWayController extends LogExController {
  constructor () {
    super()
    this.formulaPopover = null
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
    UITranslator.translate(this.exerciseType)
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
        Shows an error message.

        @param element - The DOM element
        @param {string} toolTipText - The error message
        @param {string} placement - The placement of the error message (top | bottom | left | right)
     */
  showErrorToolTip (element, toolTipText, placement) {
    if (typeof placement === 'undefined') {
      // if (placement === "undefined") {
      placement = 'top'
    }
    element.addClass('error')
    element.tooltip({
      title: toolTipText,
      placement: placement,
      template: '<div class="tooltip error"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>'
    })
    element.tooltip('show')

    // vervelende tooltips verwijderen na 5 seconden, dan hebben gebruikers ze wel gezien
    setTimeout(this.clearErrors, 5000)
  }

  /**
        Clears all errors on the screen.
     */
  clearErrors () {
    $('#validate-exercise').removeClass('error')
    $('#validate-exercise').tooltip('dispose')

    $('#formula').removeClass('error')
    $('#rule').removeClass('error')
    $('#formul1').removeClass('success')
    $('#formula').tooltip('dispose')
    $('#rule').tooltip('dispose')
    $('#equivsign').tooltip('dispose')
    $('#new-exercise-dropdown').tooltip('dispose')
    $('#solve-exercise').tooltip('dispose')
    $('#show-next-step').removeClass('error')
    $('#show-next-step').tooltip('dispose')
    $('#show-hint').tooltip('dispose')
    $('#validate-step').tooltip('dispose')

    $('#equivsign').attr('src', 'img/equivsignok.png')
  }

  /**
        Zebra stripes the proof steps.

        @param rows - The proof step rows
     */
  colorRows (rows) {
    if (rows === undefined) {
      this.colorRows($('.exercise-step-added'))
      return
    }

    let toggle = -1
    rows.each(function () {
      if (toggle < 0) {
        $(this).addClass('oneven')
      } else {
        $(this).removeClass('oneven')
      }
      toggle = toggle * -1
    })
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

    if (disable) {
      $('#wait-exercise').show()
    } else {
      $('#wait-exercise').hide()
    }
  }

  /**
        Get an example exercise.
     */

  useExercise (exnr) {
    const properties = {
      ruleJustification: document.getElementById('rule-switch').checked,
      stepValidation: document.getElementById('step-validation-switch').checked
    }

    this.reset()
    this.disableUI(true)
    const language = LogEXSession.getLanguage()
    $('#newexercise').html(Resources.getText(language, 'exercise') + ' ' + (exnr + 1))
    this.exerciseGenerator.example(exnr, this.exerciseType, properties, this.onExerciseGenerated.bind(this), this.onErrorGeneratingExercise.bind(this))
  }

  /**
        Generates an exercise.
     */
  generateExercise () {
    const properties = {
      ruleJustification: document.getElementById('rule-switch').checked,
      stepValidation: document.getElementById('step-validation-switch').checked
    }

    this.reset()
    this.disableUI(true)
    const language = LogEXSession.getLanguage()
    $('#newexercise').html(Resources.getText(language, 'newexercise'))
    this.exerciseGenerator.generate(this.exerciseType, properties, this.onExerciseGenerated.bind(this), this.onErrorGeneratingExercise.bind(this))
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

    // $('#formula').kbinput({
    //   chars: 'logic',
    //   onValueChanged: function () {
    //     $('#equivsign').attr('src', 'img/equivsignok.png')
    //     $('#equivsign').tooltip('dispose')
    //     $('#formula').removeClass('error')
    //     $('#formula').tooltip('dispose')
    //   }
    // })

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
    this.showErrorToolTip($('#formula'), Resources.getSpecificMessage(LogEXSession.getLanguage(), 'error-creating-exercise'))
  }

  /**
    */
  showExercise () {
    this.clearErrors()

    $('#exercise-steps').show()
    if ($('#new-exercise-content')) {
      $('#new-exercise-content').remove()
    }

    document.getElementById('exercise-left-formula').innerHTML = this.exercise.formulaKatex

    $('#formula').val(this.exercise.formula)
    // $('#formula').kbinput('setPreviousValue', $('#formula').val())
    $('#formulaoriginal').val($('#formula').val())

    this.disableUI(false)
    $('#active-step').show()
    $('#exercise').show()
    $('#exercise-steps').show()
    $('#equivsign').show()
    $('#validate-step').show()
    $('#formula').show()

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
    this.showErrorToolTip($('#new-exercise-dropdown'), Resources.getSpecificMessage(LogEXSession.getLanguage(), 'error-generating-exercise'), 'right')
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
      this.showErrorToolTip($('#show-next-step'), Resources.getSpecificMessage(LogEXSession.getLanguage(), 'error-solving-next-stap-inv'))
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
    this.showErrorToolTip($('#show-next-step'), Resources.getSpecificMessage(LogEXSession.getLanguage(), error))
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
    const formula = $('#formula')
    const step = this.exercise.getCurrentStep()
    const state = [this.exercise.type, step.strategyStatus, step.formula, '']
    $('#formula').popover('dispose')

    if (Rules[nextOneWayStep.rule] !== null) {
      helpText = '<div id="hint1">' + Resources.getUseRuleMessage(language, nextOneWayStep.rule) + '<br/><a href="#" id="toggle-hint1">» ' + Resources.getText(language, 'nexthint') + '</a></div>'
    }

    formula.popover({
      trigger: 'manual',
      placement: 'top',
      title: 'Hint',
      content: helpText,
      html: true
    })
    formula.popover('show')

    $('#toggle-hint1').on('click', function () {
      const oldFormula = formula.val()
      const newFormula = nextOneWayStep.formula
      formula.popover('dispose')
      helpText = '<div id="hint2">' + Resources.getFullHintMessage(language, nextOneWayStep.rule, showdiff(true, newFormula, oldFormula)) + ' <button type="button" id="auto-step" class="btn btn-success pull-right">' + Resources.getText(language, 'dostep') + '</button></div>'

      formula.popover({
        trigger: 'manual',
        placement: 'top',
        title: 'Hint',
        content: helpText,
        html: true
      })
      formula.popover('show')

      $('#auto-step').on('click', function () {
        $('#formula').popover('dispose')
        this.disableUI(true)
        this.showNextStep()
      })

      // Log hint
      IdeasServiceProxy.log(state, 'Hint: rewriteThisUsing')
    })
  }

  /**
        Handles the error that the next step can not be solved
     */
  onErrorGettingHelpForNextStep (msg) {
    this.showErrorToolTip($('#show-hint'), Resources.getSpecificMessage(LogEXSession.getLanguage(), msg))
  }

  /**
        Validates a step

     */
  validateStep () {
    if ($('#rule').val() === '' && this.exercise.usesRuleJustification && this.exercise.usesStepValidation) {
      this.showErrorToolTip($('#rule'), Resources.getSpecificMessage(LogEXSession.getLanguage(), 'no-rule'))
      return false
    }

    const changed = $('#formulaoriginal').val() !== $('#formula').val()

    if (!changed) {
      this.showErrorToolTip($('#equivsign'), Resources.getSpecificMessage(LogEXSession.getLanguage(), 'not-changed'))
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
        $('#active-step').hide()
        $('#bottom').hide()
        $('#formula').blur()

        $('.close').each(function () {
          $(this).hide()
        })

        const stepTemplate = $('#exercise-last-step-template')
        const exerciseStepHtml = stepTemplate.render({
          leftformula: this.exercise.formulaKatex,
          rightformula: this.exercise.getCurrentStep().formulaKatex
        })

        $('#active-step').before(exerciseStepHtml)
        this.disableUI(false)
      } else {
        this.clearErrors()
        $('#formula').addClass('error')
        this.disableUI(false)
        this.showErrorToolTip($('#formula'), Resources.getSpecificMessage(LogEXSession.getLanguage(), 'incomplete1'))
      }
    }
    this.disableUI(true)
    this.exerciseValidator.validateReady(this.exercise, onSuccess.bind(this), onError.bind(this))
  }

  /**
        Validates an exercise

    this.validateExercise = function () {
        this.disableUI(true);
        if (this.exercise.usesStepValidation) {
            if (this.exercise.isReady) {
                $('#active-step').hide();
                $('#bottom').hide();
                $('#formula').blur();

                $('.close').each(function () {
                    $(this).hide();
                });

                var stepTemplate = $('#exercise-last-step-template'),
                    exerciseStepHtml = stepTemplate.render({
                        "leftformula": this.exercise.formula,
                        "rightformula": this.exercise.getCurrentStep().formula
                    });

                $('#active-step').before(exerciseStepHtml);
                this.disableUI(false);
            } else {
                this.clearErrors();
                $('#formula').addClass('error');
                this.disableUI(false);
                this.showErrorToolTip($('#formula'), Resources.getSpecificMessage(LogEXSession.getLanguage(), "incomplete1"));
            }
        } else {
            this.exerciseValidator.validateExercise(this.exercise, 0, 0, this.onExerciseValidated, this.onErrorExerciseValidate);
        }
    }; */

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
    this.colorRows()
    $('#formula').blur()
    // $('.retryFormula').kbinput('hide')
    this.disableUI(false)

    if (!isReady) {
      this.showErrorToolTip($('#validate-exercise'), Resources.getSpecificMessage(LogEXSession.getLanguage(), 'incomplete'))
    }
  }

  onErrorExerciseValidate () {
    this.showErrorToolTip($('#validate-step'), Resources.getSpecificMessage(LogEXSession.getLanguage(), 'error-validating-exercise'))
  }

  /**
        Handles the event that a step is validated

     */
  onStepValidated () {
    const currentStep = this.exercise.getCurrentStep()
    let message
    let errorPlace

    this.clearErrors() // verwijder alle voorgaande foutmeldingen van het scherm
    document.getElementById('step-validation-switch').disabled = true // $('#step-validation-switch').bootstrapSwitch('disabled', false) // na validatie van minstens 1 stap, mag de gebruiker niet meer de optie hebben om "correctie per stap" te wijzigen

    // de stap is niet valid en gebruikt stap validatie
    if (!currentStep.isValid && this.exercise.usesStepValidation) {
      message = Resources.getSpecificMessage(LogEXSession.getLanguage(), 'wrongstep')
      this.exercise.steps.pop()

      if (!currentStep.isSyntaxValid) { // Foutieve syntax
        message = Resources.getInvalidFormulaMessage() // + ": " + currentStep.syntaxError;
        errorPlace = $('#formula')
      } else if (currentStep.isSimilar) { // Ongewijzigde formule
        message = Resources.getSpecificMessage(LogEXSession.getLanguage(), 'similar')
        errorPlace = $('#formula')
      } else if (currentStep.isCorrect) { // Gemaakte stap is juist, maar onduidelijk wat de gebruiker heeft uitgevoerd
        message = Resources.getSpecificMessage(LogEXSession.getLanguage(), 'correctnotval')
        errorPlace = $('#formula')
      } else if (currentStep.isBuggy) { // Gemaakte stap is foutief, maar de strategie weet wat er fout is gegaan
        message = Resources.getMessageForBuggyRule(LogEXSession.getLanguage(), currentStep.buggyRule)
        errorPlace = $('#formula')
      } else if (!currentStep.isRuleValid) { // De ingegeven regel is niet correct
        message = Resources.getSpecificMessage(LogEXSession.getLanguage(), 'wrongrule')
        errorPlace = $('#rule')
      } else if (!currentStep.isValid) {
        message = Resources.getSpecificMessage(LogEXSession.getLanguage(), 'wrongstep')
        errorPlace = $('#formula')
      }

      this.disableUI(false) // disableUI(false) moet opgeroepen worden voordat de errorTooltip getoond wordt, anders wordt de tooltip te laag getoond (= hoogte van het wait-icoontje)
      this.showErrorToolTip(errorPlace, message)
      $('#equivsign').attr('src', 'img/equivsignerr.png')
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
    this.showErrorToolTip($('#validate-step'), Resources.getSpecificMessage(LogEXSession.getLanguage(), 'error-validating-step'))
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
      this.showErrorToolTip($('#formula'), Resources.getSpecificMessage(LogEXSession.getLanguage(), 'invalidformula'), 'bottom')
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

  /**
        Inserts a proof step

        @param {ProofStep} step - The proof step
        @param {Boolean} canDelete - True if the proof step can be deleted, false otherwise
     */
  insertStep (step, canDelete) {
    const exerciseStepHtml = this.renderStep(step, canDelete)

    $('#active-step').before(exerciseStepHtml)
    this.colorRows()
  }

  renderStep (step, canDelete) {
    let rule = ''
    const stepTemplate = $.templates('#exercise-step-template')
    const error = ''

    // nog te doen:
    // check: afhankelijk van de waarden in step welke error getoond moet worden

    if (step.rule === null) { // dit is de startopgave
      return
    }

    if (step.rule !== '') {
      rule = Resources.getRule(LogEXSession.getLanguage(), step.rule)
    }

    const exerciseStepHtml = stepTemplate.render({
      error: error,
      rule: rule,
      formula: step.formulaKatex,
      isWrong: false,
      hasRule: true,
      canDelete: canDelete,
      step: 1,
      stepValidation: true
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

    $('.close').each(function () {
      $(this).hide()
    })
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
    this.colorRows()

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
    this.colorRows()

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
