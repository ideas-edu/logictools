import $ from 'jquery'
import jsrender from 'jsrender'
import 'bootstrap'
import 'iframe-resizer'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-switch/dist/css/bootstrap3/bootstrap-switch.min.css'
import 'bootstrap-switch'
import { FormulaPopover } from '../../shared/kbinput/kbinput.js'

import { BTN_OK, BTN_SHOW_NEXT_STEP, BTN_SHOWDERIVATION, BTN_DERIVATIONDONE, BTN_NEWEXERCISE, BTN_GENERATEEXERCISENORMAL, BTN_LOGOUT, SWITCH_RULE, VAL_SETONLABEL, VALSETOFFLABEL, LBL_RULEJUSTIFICATION, SWITCH_VALIDATION, LBL_STEPVALIDATION, BTN_SHOWHINT, BTN_SOLVEEXERCISE, BTN_VALIDATESTEP } from '../constants.js'
import { config } from '../config.js'
import { LogEXSession } from '../logEXSession.js'
import { Resources } from '../resources.js'
import { KeyBindings } from '../keyBindings.js'
import { OneWayExerciseGenerator } from '../model/oneway/exerciseGenerator.js'
import { OneWayExerciseCreator } from '../model/oneway/exerciseCreator.js'
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

    $(BTN_OK).html("<i class='icon-ok'></i> " + Resources.getText(language, 'send'))
    $(BTN_SHOW_NEXT_STEP).html(Resources.getText(language, 'step'))
    $(BTN_SHOWDERIVATION).html("<i class='icon-key'> </i> " + Resources.getText(language, 'showderivation'))
    $(BTN_DERIVATIONDONE).html("<i class='icon-ok'></i> " + Resources.getText(language, 'derivationdone'))
    $(BTN_NEWEXERCISE).html("<i class='icon-refresh'></i> " + Resources.getText(language, 'newexercise'))
    $('#generate-exercise-easy').html(Resources.getText(language, 'exeasy'))
    $(BTN_GENERATEEXERCISENORMAL).html(Resources.getText(language, 'exnormal'))
    $('#generate-exercise-difficult').html(Resources.getText(language, 'exhard'))
    $('#new-exercise').html(Resources.getText(language, 'new-exercise'))

    // Translate the example exercises
    for (let i = 0; i < exampleExercises.length; i++) {
      const nr = exampleExercises[i] + 1
      const id = 'exercise' + nr
      $('#' + id).html(Resources.getText(language, 'exercise') + ' ' + nr)
    }

    $('#help').html("<i class='icon-question-sign'></i> " + Resources.getText(language, 'help'))
    $('#help').attr('href', 'LogEQ_manual_' + language + '.pdf').attr('target', '_new')
    $(BTN_LOGOUT).html("<i class='icon-signout'></i> " + Resources.getText(language, 'logout'))
    if ($('#create-exercise-button-content') !== null) {
      $('#create-exercise-button-content').html("<i class='icon-ok'></i> " + Resources.getText(language, 'create-exercise-button'))
    }

    $(LBL_RULEJUSTIFICATION).html(Resources.getText(language, 'rulejustification'))
    $(SWITCH_RULE).bootstrapSwitch('onText', Resources.getText(language, 'on')) // sets the text of the "on" label
    $(SWITCH_RULE).bootstrapSwitch('offText', Resources.getText(language, 'off')) // sets the text of the "off" label

    $(LBL_STEPVALIDATION).html(Resources.getText(language, 'stepvalidation'))
    $(SWITCH_VALIDATION).bootstrapSwitch('onText', Resources.getText(language, 'on')) // sets the text of the "on" label
    $(SWITCH_VALIDATION).bootstrapSwitch('offText', Resources.getText(language, 'off')) // sets the text of the "off" label
  }
}

/**
    OneWayController is responsible for handling all user interaction and manipulation of the user interface.
    @constructor
 */

function OneWayController () {
  'use strict'

  const self = this
  this.exerciseType = ''
  this.exercise = null
  this.dummyExercise = null // wordt gebruikt om te testen of de laatste stap equivalent is met de opgave bij shownextstep met validatie per stap af.
  this.isFormulaValid = true
  this.keyBindings = new KeyBindings(this)
  this.formulaPopover = null
  this.exampleExercises = null

  /**
        Gets the exercisetype as given in the querystring
    */
  this.getExerciseType = function () {
    const sPageURL = window.location.search.substring(1)
    const sURLVariables = sPageURL.split('&')
    let sParameterName
    let i

    for (i = 0; i < sURLVariables.length; i += 1) {
      sParameterName = sURLVariables[i].split('=')
      if (sParameterName[0] === 'exerciseType') {
        this.exerciseType = sParameterName[1]
        return
      }
    }
  }

  /**
        Gets the formula as given in the querystring
    */
  this.getFormula = function () {
    const sPageURL = window.location.search.substring(1)
    const sURLVariables = sPageURL.split('&')
    let sParameterName
    let i

    for (i = 0; i < sURLVariables.length; i += 1) {
      sParameterName = sURLVariables[i].split('=')
      if (sParameterName[0] === 'formula') {
        this.exerciseType = sParameterName[1]
        return
      }
    }
  }

  /**
        Creates the popover for the input of symbols
    */
  this.initializeInput = function () {
    const characterOptions = [
      {
        char: '¬',
        triggers: ['-', 'n', '~', '1']
      },
      {
        char: '∧',
        triggers: ['a', '7', '6'],
        spaces: true
      },
      {
        char: '∨',
        triggers: ['o', 'v', '|'],
        spaces: true
      },
      {
        char: '→',
        triggers: ['i', '.'],
        spaces: true
      },
      {
        char: '↔',
        triggers: ['=', 'e'],
        spaces: true
      },
      { char: 'p' },
      { char: 'q' },
      { char: 'r' },
      { char: 's' },
      {
        char: '(',
        triggers: ['9']
      },
      {
        char: ')',
        triggers: ['0']
      }
    ]
    const formulaOptions = {
      id: 1,
      characters: characterOptions
    }
    this.formulaPopover = new FormulaPopover(document.getElementById('formula'), formulaOptions)
  }

  /**
        Sets the example exercises
    */
  this.setExampleExercises = function () {
    this.exampleExercises = config.exampleExercises[self.exerciseType]

    // inserts the example exercises
    for (let i = 0; i < this.exampleExercises.length; i++) {
      const nr = self.exampleExercises[i] + 1
      const id = 'exercise' + nr
      $('#new-exercise-menu').append('<li><a href="#" id="' + id + '"></a></li>')
    }

    // inserts the randomly generated exercises
    if (config.randomExercises) {
      $('#new-exercise-menu').append('<li class="divider"></li>')
      $('#new-exercise-menu').append('<li><a href="#" id="' + 'generate-exercise-easy' + '"></a></li>')
      $('#new-exercise-menu').append('<li><a href="#" id="' + 'generate-exercise-normal' + '"></a></li>')
      $('#new-exercise-menu').append('<li><a href="#" id="' + 'generate-exercise-difficult' + '"></a></li>')
    }

    // inserts own input exercises
    if (config.inputOwnExercise) {
      $('#new-exercise-menu').append('<li class="divider"></li>')
      $('#new-exercise-menu').append('<li><a href="#" id="' + 'new-exercise' + '"></a></li>')
    }

    // installs event handlers
    $('#generate-exercise-easy').click(function () {
      LogEXSession.setDifficulty('easy')
      self.generateExercise()
    })
    $(BTN_GENERATEEXERCISENORMAL).click(function () {
      LogEXSession.setDifficulty('medium')
      self.generateExercise()
    })

    $('#generate-exercise-difficult').click(function () {
      LogEXSession.setDifficulty('difficult')
      self.generateExercise()
    })

    $('#new-exercise').click(function () {
      self.newExercise()
    })
  }

  /**
        Initializes all buttons and label to correct language
     */
  this.initializeLabels = function () {
    UITranslator.translate(self.exerciseType)
  }

  /**
        Initializes rule justification
     */
  this.initializeRuleJustification = function () {
    $(SWITCH_RULE).bootstrapSwitch('state', config.useRuleJustification)
    if (!config.displayRuleJustification) {
      $(LBL_RULEJUSTIFICATION).hide()
      $(SWITCH_RULE).hide()
    }
  }

  /**
        Initializes step validation
     */
  this.initializeStepValidation = function () {
    $(SWITCH_VALIDATION).bootstrapSwitch('state', config.useStepValidation)
    if (!config.displayStepValidation) {
      $(LBL_STEPVALIDATION).hide()
      $(SWITCH_VALIDATION).hide()
    }
  }

  /**
        Initializes hint, next step and complete derivation button
     */
  this.initializeButtons = function () {
    if (!config.displayHintButton) {
      $(BTN_SHOWHINT).hide()
    }
    if (!config.displayNextStepButton) {
      $(BTN_SHOW_NEXT_STEP).hide()
    }
    if (!config.displayDerivationButton) {
      $(BTN_SHOWDERIVATION).hide()
      $(BTN_SOLVEEXERCISE).hide()
    }
  }

  /**
        Initializes drop down box for rules from Rules dictionary
     */
  this.initializeRules = function (comboRule) {
    const language = LogEXSession.getLanguage()
    let previousRule = 'START' // For unification of the Rules list
    let rule

    // Clear ruleset if already set
    comboRule.find('option').remove().end()

    for (rule in Rules) {
      // Rule will only be displayed if it has not already been displayed
      if (Rules.hasOwnProperty(rule) && Resources.getRule(language, rule) !== previousRule) {
        $('<option/>').val(rule).html(Resources.getRule(language, rule)).appendTo(comboRule)
        previousRule = Resources.getRule(language, rule)
      }
    }
  }

  /**
        Gets the html code for an combobox to be used in the rendered step
    */
  this.renderRuleCombobox = function (selectedRule) {
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
  this.showErrorToolTip = function (element, toolTipText, placement) {
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
  this.clearErrors = function () {
    $('#validate-exercise').removeClass('error')
    $('#validate-exercise').tooltip('dispose')

    $('#formula').removeClass('error')
    $('#rule').removeClass('error')
    $('#formul1').removeClass('success')
    $('#formula').tooltip('dispose')
    $('#rule').tooltip('dispose')
    $('#equivsign').tooltip('dispose')
    $('#new-exercise-dropdown').tooltip('dispose')
    $(BTN_SOLVEEXERCISE).tooltip('dispose')
    $(BTN_SHOW_NEXT_STEP).removeClass('error')
    $(BTN_SHOW_NEXT_STEP).tooltip('dispose')
    $(BTN_SHOWHINT).tooltip('dispose')
    $(BTN_VALIDATESTEP).tooltip('dispose')

    $('#equivsign').attr('src', 'img/equivsignok.png')
  }

  /**
        Zebra stripes the proof steps.

        @param rows - The proof step rows
     */
  this.colorRows = function (rows) {
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
  this.reset = function () {
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

  this.disableUI = function (disable) {
    $(':input').attr('disabled', disable)

    if (disable) {
      $('#wait-exercise').show()
    } else {
      $('#wait-exercise').hide()
    }
  }

  // exercise generation
  this.exerciseGenerator = new OneWayExerciseGenerator()

  /**
        Get an example exercise.
     */

  this.useExercise = function (exnr) {
    const ruleJustification = $(SWITCH_RULE).bootstrapSwitch('state')
    const stepValidation = $(SWITCH_VALIDATION).bootstrapSwitch('state')

    this.reset()
    this.disableUI(true)
    const language = LogEXSession.getLanguage()
    $('#newexercise').html(Resources.getText(language, 'exercise') + ' ' + (exnr + 1))
    this.exerciseGenerator.example(exnr, this.exerciseType, ruleJustification, stepValidation, this.onExerciseGenerated, this.onErrorGeneratingExercise)
  }

  /**
        Generates an exercise.
     */
  this.generateExercise = function () {
    const ruleJustification = $(SWITCH_RULE).bootstrapSwitch('state')
    const stepValidation = $(SWITCH_VALIDATION).bootstrapSwitch('state')

    this.reset()
    this.disableUI(true)
    const language = LogEXSession.getLanguage()
    $('#newexercise').html(Resources.getText(language, 'newexercise'))
    this.exerciseGenerator.generate(this.exerciseType, ruleJustification, stepValidation, this.onExerciseGenerated, this.onErrorGeneratingExercise)
  }

  /**
        Shows the form for creating a new exercise
     */
  this.newExercise = function () {
    const newExerciseTemplate = $('#new-exercise-template')
    const newExerciseHtml = newExerciseTemplate.render()

    this.reset()
    $('#bottom').hide()
    $('#exercise-steps').hide()
    $(newExerciseHtml).insertBefore('#exercise-steps')
    $('#create-exercise-button-content').html("<i class='icon-ok'></i> " + Resources.getText(LogEXSession.getLanguage(), 'create-exercise-button'))
    $('#formula').focus()

    $('#create-exercise-button').click(function () {
      self.createExercise()
    })

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
    $('#create-exercise-button-content').html("<i class='icon-ok'></i> " + Resources.getText(LogEXSession.getLanguage(), 'create-exercise-button'))
  }

  // exercise creation
  this.exerciseCreator = new OneWayExerciseCreator()

  /**
        Creates a new exercise
    This version uses exerciseCreator
    (that makes a call to service create)
     */

  this.createExercise = function () {
    const exerciseMethod = Resources.getExerciseMethod(self.exerciseType)
    const ruleJustification = $(SWITCH_RULE).bootstrapSwitch('state') // true || false
    const stepValidation = $(SWITCH_VALIDATION).bootstrapSwitch('state') // true || false

    self.disableUI(true)
    LogEXSession.setDifficulty('normal')
    self.exercise = new OneWayExercise($('#formula').val(), exerciseMethod, ruleJustification, stepValidation)
    self.exerciseCreator.create(exerciseMethod, $('#formula').val(), ruleJustification, stepValidation, self.showExercise, self.onErrorCreatingExercise)
  }

  /**
        Creates a new exercise

    this.createExercise = function () {
        var exerciseMethod = Resources.getExerciseMethod(self.exerciseType), // vertaal naar servicenaam
            ruleJustification = true, // $(SWITCH_RULE).bootstrapSwitch().state, // true || false
            stepValidation = true; // $(SWITCH_VALIDATION).bootstrapSwitch().state; // true || false

        self.disableUI(true);
        LogEXSession.setDifficulty("normal");
        self.exercise = new OneWayExercise($('#formula').val(), exerciseMethod, ruleJustification, stepValidation);
        self.exerciseSolver.solve(self.exercise, self.showExercise, self.onErrorCreatingExercise);
    }; */

  /**
        Handles the error that an exercise can not be created
     */
  this.onErrorCreatingExercise = function () {
    self.disableUI(false)
    self.showErrorToolTip($('#formula'), Resources.getSpecificMessage(LogEXSession.getLanguage(), 'error-creating-exercise'))
  }

  /**
    */
  this.showExercise = function () {
    self.clearErrors()

    $('#exercise-steps').show()
    if ($('#new-exercise-content')) {
      $('#new-exercise-content').remove()
    }

    $('#exercise-left-formula').text(self.exercise.formula)

    $('#formula').val(self.exercise.formula)
    // $('#formula').kbinput('setPreviousValue', $('#formula').val())
    $('#formulaoriginal').val($('#formula').val())

    self.disableUI(false)
    $('#active-step').show()
    $('#exercise').show()
    $('#exercise-steps').show()
    $('#equivsign').show()
    $('#validate-step').show()
    $('#formula').show()

    if (config.displayDerivationButton) {
      $(BTN_SOLVEEXERCISE).show()
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
    self.exercise.usesRuleJustification = $(SWITCH_RULE).bootstrapSwitch('state')

    // rvl: Check if rule justification is needed
    if (self.exercise.usesRuleJustification) {
      $('#rule').show()
    } else {
      $('#rule').hide()
    }

    $(SWITCH_VALIDATION).bootstrapSwitch('disabled', true) // true || false
  }

  /**
        Handles the event that an exercise is generated
     */
  this.onExerciseGenerated = function (exercise) {
    self.exercise = exercise
    self.showExercise()
  }

  /**
        Handles the error that an exercise can not generated
     */
  this.onErrorGeneratingExercise = function () {
    self.disableUI(false)
    self.showErrorToolTip($('#new-exercise-dropdown'), Resources.getSpecificMessage(LogEXSession.getLanguage(), 'error-generating-exercise'), 'right')
  }

  this.showSolution = function () {
    window.open('onewaysolution.html?formula=' + this.exercise.formula + '&exerciseType=' + this.exercise.type, '_blank', 'location=no,width=1020,height=600,status=no,toolbar=no')
  }

  this.exerciseSolver = new OneWayExerciseSolver()

  /**
        Shows the next step
     */
  this.showNextStep = function () {
    this.dummyExercise = new OneWayExercise(this.exercise.formula, this.exercise.type, false, false)
    this.dummyExercise.steps.push(new OneWayStep(this.exercise.getCurrentStep().formula, ''))
    this.disableUI(true)
    this.exerciseSolver.solveNextStep(this.exercise, this.onNextStepSolved, this.onErrorSolvingNextStep)

    /**
        if (!this.exercise.usesStepValidation && this.exercise.steps.steps.length > 1) {
            this.exerciseValidator.validateStep(this.exercise.type, false, this.dummyExercise.getPreviousStep(), this.dummyExercise.getCurrentStep(), this.showNextStepWithoutStepValidation, this.onErrorSolvingNextStep);

        } else {
            this.exerciseSolver.solveNextStep(this.exercise, this.onNextStepSolved, this.onErrorSolvingNextStep);
        } */
  }

  this.showNextStepWithoutStepValidation = function () {
    if (self.dummyExercise.getCurrentStep().isValid || self.dummyExercise.getCurrentStep().isCorrect) {
      self.exerciseSolver.solveNextStep(self.exercise, self.onNextStepSolved, self.onErrorSolvingNextStep)
    } else {
      self.disableUI(false)
      self.showErrorToolTip($(BTN_SHOW_NEXT_STEP), Resources.getSpecificMessage(LogEXSession.getLanguage(), 'error-solving-next-stap-inv'))
    }
  }

  /**
        Handles the event thats the next step of an exercise is solved
        @param {ProofStep} nextStep - The next step
     */
  this.onNextStepSolved = function (nextStep) {
    // if (nextStep !== null) {
    //    self.exercise.steps.push(nextStep);
    //    if (self.exercise.usesStepValidation) {
    //        self.exerciseValidator.validateStep(self.exercise.type, self.exercise.usesRuleJustification, self.exercise.getPreviousStep(), self.exercise.getCurrentStep(), self.onStepValidated, self.onErrorValidatingStep);
    //    } else {
    //        self.onStepValidated();
    //    }
    // }

    if (nextStep !== null) {
      self.clearErrors() // verwijder alle voorgaande foutmeldingen van het scherm
      $(SWITCH_VALIDATION).bootstrapSwitch('disabled', false) // na validatie van minstens 1 stap, mag de gebruiker niet meer de optie hebben om "correctie per stap" te wijzigen

      self.exercise.steps.push(nextStep)
      self.insertStep(nextStep, true)
      self.exercise.isReady = nextStep.isReady
      self.disableUI(false) // UI hier terug enabled, anders worden de popovers verkeerd gepositioneerd.

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
      self.disableUI(false) // UI ook hier terug enabled in geval er geen volgende stappen meer zijn.
    }
  }

  /**
        Handles the error that the next step can not be solved
     */
  this.onErrorSolvingNextStep = function (error) {
    self.disableUI(false)
    self.showErrorToolTip($(BTN_SHOW_NEXT_STEP), Resources.getSpecificMessage(LogEXSession.getLanguage(), error))
  }

  /**
        Shows the hint
     */
  this.showHint = function () {
    this.exerciseSolver.getHelpForNextStep(this.exercise, this.onHelpForNextStepFound, this.onErrorGettingHelpForNextStep)
  }

  /**
        Handles the event that help for a next step is found
        @param {OneWayStep} nextOneWayStep - The next one way step
     */
  this.onHelpForNextStepFound = function (nextOneWayStep) {
    const language = LogEXSession.getLanguage()
    let helpText = Resources.getText(language, 'nohint')
    const formula = $('#formula')
    const step = self.exercise.getCurrentStep()
    const state = [self.exercise.type, step.strategyStatus, step.formula, '']
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
        self.disableUI(true)
        self.showNextStep()
      })

      // Log hint
      IdeasServiceProxy.log(state, 'Hint: rewriteThisUsing')
    })
  }

  /**
        Handles the error that the next step can not be solved
     */
  this.onErrorGettingHelpForNextStep = function (msg) {
    self.showErrorToolTip($(BTN_SHOWHINT), Resources.getSpecificMessage(LogEXSession.getLanguage(), msg))
  }

  // validation
  this.exerciseValidator = new OneWayExerciseValidator()
  this.syntaxValidator = new SyntaxValidator()

  /**
        Validates a step

     */
  this.validateStep = function () {
    if ($('#rule').val() === '' && self.exercise.usesRuleJustification && self.exercise.usesStepValidation) {
      self.showErrorToolTip($('#rule'), Resources.getSpecificMessage(LogEXSession.getLanguage(), 'no-rule'))
      return false
    }

    const changed = $('#formulaoriginal').val() !== $('#formula').val()

    if (!changed) {
      self.showErrorToolTip($('#equivsign'), Resources.getSpecificMessage(LogEXSession.getLanguage(), 'not-changed'))
      return false
    }

    self.disableUI(true)
    self.clearErrors()
    self.exercise.steps.push(new OneWayStep($('#formula').val(), $('#rule').val()))
    if (self.exercise.usesStepValidation) {
      self.exerciseValidator.validateStep(self.exercise.type, self.exercise.usesRuleJustification, self.exercise.getPreviousStep(), self.exercise.getCurrentStep(), self.onStepValidated, self.onErrorValidatingStep)
    } else {
      self.onStepValidated()
    }
  }

  /**
        Validates an exercise
      */

  this.validateExercise = function () {
    if (this.exercise.usesStepValidation) {
      self.checkIfReady()
    } else {
      self.exerciseValidator.validateExercise(self.exercise, 0, 0, self.onExerciseValidated, self.onErrorExerciseValidate)
    }
  }

  /**
    Check if the exrecise is completed
      */

  this.checkIfReady = function () {
    const step = this.exercise.getCurrentStep()
    const state = [this.exercise.type, step.strategyStatus, step.formula, '']
    const onError = function (data) {
      alert('Error calling ready service')
    }
    const onSuccess = function (data) {
      if (data.result) {
        $('#active-step').hide()
        $('#bottom').hide()
        $('#formula').blur()

        $('.close').each(function () {
          $(this).hide()
        })

        const stepTemplate = $('#exercise-last-step-template')
        const exerciseStepHtml = stepTemplate.render({
          leftformula: self.exercise.formula,
          rightformula: self.exercise.getCurrentStep().formula
        })

        $('#active-step').before(exerciseStepHtml)
        self.disableUI(false)
      } else {
        self.clearErrors()
        $('#formula').addClass('error')
        self.disableUI(false)
        self.showErrorToolTip($('#formula'), Resources.getSpecificMessage(LogEXSession.getLanguage(), 'incomplete1'))
      }
    }
    this.disableUI(true)
    IdeasServiceProxy.ready(state, onSuccess, onError)
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
                self.showErrorToolTip($('#formula'), Resources.getSpecificMessage(LogEXSession.getLanguage(), "incomplete1"));
            }
        } else {
            self.exerciseValidator.validateExercise(self.exercise, 0, 0, self.onExerciseValidated, self.onErrorExerciseValidate);
        }
    }; */

  this.onExerciseValidated = function () {
    let i = 0
    let isReady = false
    let completelyCorrect = true

    self.reset()
    $.each(self.exercise.steps.steps, function () {
      let rule = ''
      const stepTemplate = $.templates('#exercise-step-template')
      let error = ''
      let exerciseStepHtml

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

      exerciseStepHtml = stepTemplate.render({
        rule: rule,
        formula: this.formula,
        canDelete: false,
        isWrong: !this.isValid,
        hasRule: this.rule !== undefined,
        step: i,
        ruleCombobox: self.renderRuleCombobox(this.rule),
        stepValidation: false,
        ruleJustification: self.exercise.usesRuleJustification,
        error: error
      })

      $('#active-step').before(exerciseStepHtml)

      if (this.isReady && !isReady && completelyCorrect === true) {
        isReady = true
        self.insertLastStep(this)
      }

      if (!this.isRuleValid && i > 0) {
        self.initializeRules($('#rule' + i))
      }

      i += 1
    })

    $('#formula').val(self.exercise.getCurrentStep().formula)
    // $('#formula').kbinput('setPreviousValue', $('#formula').val())
    $('#formulaoriginal').val($('#formula').val())
    self.colorRows()
    $('#formula').blur()
    // $('.retryFormula').kbinput('hide')
    self.disableUI(false)

    if (!isReady) {
      self.showErrorToolTip($('#validate-exercise'), Resources.getSpecificMessage(LogEXSession.getLanguage(), 'incomplete'))
    }
  }

  this.onErrorExerciseValidate = function () {
    self.showErrorToolTip($(BTN_VALIDATESTEP), Resources.getSpecificMessage(LogEXSession.getLanguage(), 'error-validating-exercise'))
  }

  /**
        Handles the event that a step is validated

     */
  this.onStepValidated = function () {
    const currentStep = self.exercise.getCurrentStep()
    let message
    let errorPlace

    self.clearErrors() // verwijder alle voorgaande foutmeldingen van het scherm
    $(SWITCH_VALIDATION).bootstrapSwitch('disabled', false) // na validatie van minstens 1 stap, mag de gebruiker niet meer de optie hebben om "correctie per stap" te wijzigen

    // de stap is niet valid en gebruikt stap validatie
    if (!currentStep.isValid && self.exercise.usesStepValidation) {
      message = Resources.getSpecificMessage(LogEXSession.getLanguage(), 'wrongstep')
      self.exercise.steps.pop()

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

      self.disableUI(false) // disableUI(false) moet opgeroepen worden voordat de errorTooltip getoond wordt, anders wordt de tooltip te laag getoond (= hoogte van het wait-icoontje)
      self.showErrorToolTip(errorPlace, message)
      $('#equivsign').attr('src', 'img/equivsignerr.png')
    } else {
      self.insertStep(currentStep, true)
      self.exercise.isReady = currentStep.isReady

      // bij auto step is formula nog niet goed gevuld
      $('#formula').val(currentStep.formula)
      // $('#formula').kbinput('setPreviousValue', $('#formula').val())
      $('#formulaoriginal').val($('#formula').val())

      self.disableUI(false)

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
  this.onErrorValidatingStep = function () {
    self.exercise.steps.pop()
    self.disableUI(false)
    self.showErrorToolTip($(BTN_VALIDATESTEP), Resources.getSpecificMessage(LogEXSession.getLanguage(), 'error-validating-step'))
  }

  /**
        Validates the formulas

        @param onFormulasValidated - The callback function
     */
  this.validateInput = function (afterInputValidated) {
    this.clearErrors()
    this.validateFormula($('#formula'), function (isValid, formulaText) {
      self.onInputValidated(isValid, formulaText, afterInputValidated)
    })
  }

  /**
        Handles the event that formula 1 is validated

        @param {Boolean} isValid - True if valid, false otherwise
        @param {String} formulaText - The text of the formula
        @param onFormulasValidated - The callback function
     */
  this.onInputValidated = function (isValid, formulaText, afterInputValidated) {
    self.onFormulaValidated(isValid, formulaText)
    afterInputValidated()
  }

  /**
        Handles the event that a formula is validated

        @param {Boolean} isValid - True if the formula is valid, false otherwise
        @param {String} formulaText - The text of the formula
     */
  // this.onFormulaValidated = function (isValid, formulaText) {
  this.onFormulaValidated = function (isValid) {
    if (!isValid) {
      self.showErrorToolTip($('#formula'), Resources.getSpecificMessage(LogEXSession.getLanguage(), 'invalidformula'), 'bottom')
    }
    self.isFormulaValid = isValid
  }

  /**
        Validates the formula

        @param formula - The DOM element that contains the formula
        @param onFormulasValidated - The callback function
     */
  this.validateFormula = function (formula, callback) {
    // if (typeof callback === "undefined") {
    if (callback === 'undefined') {
      callback = this.onFormulaValidated
    }

    if (self.exercise.usesStepValidation) {
      this.syntaxValidator.validateSyntax(formula.val(), callback)
    } else {
      callback(true, formula.val())
    }
  }

  /**
        Inserts a proof step

        @param {ProofStep} step - The proof step
        @param {Boolean} canDelete - True if the proof step can be deleted, false otherwise
     */
  this.insertStep = function (step, canDelete) {
    const exerciseStepHtml = this.renderStep(step, canDelete)

    $('#active-step').before(exerciseStepHtml)
    this.colorRows()
  }

  this.renderStep = function (step, canDelete) {
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
      formula: step.formula,
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
  this.insertLastStep = function (step) {
    const stepTemplate = $('#exercise-last-step-template')
    const exerciseStepHtml = stepTemplate.render({
      leftformula: this.exercise.formula,
      rightformula: step.formula
    })

    $('#active-step').before(exerciseStepHtml)
    $('#active-step').hide()
    $('#bottom').hide()
    $('#formula').blur()

    $('.close').each(function () {
      $(this).hide()
    })
    this.clearErrors()

    $(SWITCH_VALIDATION).bootstrapSwitch('disabled', true) // true || false
  }

  /**
        Removes the top steps, starting at the specified source index

        @param source - The source DOM element
     */
  this.removeTopStep = function (source) {
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

  this.retryFormula = function (source) {
    const parent = source.parents('div.exercise-step-added')
    const allExerciseSteps = $('#exercise-steps div.exercise-step-added')
    const index = allExerciseSteps.index(parent)

    this.exercise.steps.steps[index].formula = source.val()
  }

  this.retryRule = function (source) {
    const parent = source.parents('div.exercise-step-added')
    const allExerciseSteps = $('#exercise-steps div.exercise-step-added')
    const index = allExerciseSteps.index(parent)

    this.exercise.steps.steps[index].rule = source.val()
  }

  /**
        Removes the bottom steps, starting at the specified source index

        @param source - The source DOM element
     */
  this.removeBottomStep = function (source) {
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
  //    self.initializeLabels();
  //    self.initializeRules($('#rule'));
  //    $("#button-NL").addClass('active');
  //    $("#button-EN").removeClass('active');
  //    alert("inOnewaycontroller");
  // });

  // $("#lang-EN").click(function () {
  //    LogEXSession.setLanguage("EN");
  //    self.initializeLabels();
  //    self.initializeRules($('#rule'));
  //    $("#button-EN").addClass('active');
  //    $("#button-NL").removeClass('active');
  //    alert("inOneWayController");
  // });

  $(BTN_LOGOUT).click(function () {
    LogEXSession.logout()
    window.location = 'login.html'
  })

  /**
      Use the example exercises
    */
  this.bindExampleExercises = function () {
    for (let i = 0; i < self.exampleExercises.length; i++) {
      const nr = self.exampleExercises[i]
      const id = '#exercise' + (nr + 1);

      (function (_nr, _id) {
        $(_id).click(function () {
          self.useExercise(_nr)
        })
      })(nr, id)
    }
  }

  $('#generate-exercise').click(function () {
    if (config.randomExercises) {
      self.generateExercise()
    }
  })

  $(BTN_SOLVEEXERCISE).click(function () {
    self.showSolution()
  })

  $(BTN_VALIDATESTEP).click(function () {
    $('#formula').popover('dispose')
    self.validateStep()
  })

  $('#validate-exercise').click(function () {
    $('#formula').popover('dispose')
    self.validateExercise()
  })

  $(BTN_SHOW_NEXT_STEP).click(function () {
    $('#formula').popover('dispose')
    self.showNextStep()
  })

  $('body').on('click', 'button.remove-top-step', function () {
    $('#formula').popover('dispose')
    self.removeTopStep($(this))
  })

  $('body').on('focusout', '.retryFormula', function () {
    self.retryFormula($(this))
  })

  $('body').on('focusout', '.retryRule', function () {
    $('#formula').popover('hide')
    self.retryRule($(this))
  })

  $('body').on('focus', '.retryRule', function () {
    $('#formula').popover('hide')
    $('.retryFormula').popover('hide')
    self.retryRule($(this))
  })

  $('#rule').change(function () {
    $('#formula').popover('hide')
    $('.retryFormula').popover('hide')
    self.clearErrors()
  })

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

  $(BTN_SHOWHINT).click(function () {
    $('#formula').popover('dispose')
    self.showHint()
  })

  this.changeRuleJustification = function (ruleJustification) {
    if (this.exercise) {
      this.exercise.usesRuleJustification = ruleJustification
    }
    if (ruleJustification) {
      $('#rule').show()
    } else {
      $('#rule').hide()
    }
  }

  $(SWITCH_RULE).on('switchChange.bootstrapSwitch', function (e, data) {
    self.changeRuleJustification(data)
  })

  this.changeStepValidation = function (stepValidation) {
    if (this.exercise) {
      this.exercise.usesStepValidation = stepValidation
    }
  }

  $(SWITCH_VALIDATION).on('switchChange.bootstrapSwitch', function (e, data) {
    self.changeStepValidation(data)
  })

  // key bindings
  $(document).bind('keydown', function (e) {
    self.keyBindings.onKeyDown(e)
  })
}
