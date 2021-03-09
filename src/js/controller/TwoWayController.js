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
import { Equation } from '../model/twoway/equation.js'
import { TwoWayExerciseGenerator } from '../model/twoway/exerciseGenerator.js'
import { TwoWayExerciseSolver } from '../model/twoway/exerciseSolver.js'
import { TwoWayExerciseValidator } from '../model/twoway/exerciseValidator.js'
import { TwoWayStep } from '../model/twoway/step.js'
import { TwoWayExercise } from '../model/twoway/exercise.js'
import { SyntaxValidator } from '../model/syntaxValidator.js'
import { Rules } from '../model/rules.js'
import { IdeasServiceProxy } from '../model/ideasServiceProxy.js'
import { showdiff } from '../showdiff.js'

jsrender($); // load JsRender jQuery plugin methods

(function () {
  $(document).ready(function () {
    const controller = new TwoWayController()
    controller.getExerciseType()
    controller.initializeStepValidation()
    controller.initializeButtons()
    controller.initializeInput()
    controller.setExampleExercises()
    controller.initializeLabels()
    controller.initializeRules()
    controller.bindExampleExercises()
    if (config.randomExercises) {
      controller.generateExercise()
    } else {
      controller.useExercise(0)
    }
  })
})()

/**
    TwoWayController is responsible for handling all user interaction and manipulation of the user interface.
    @constructor
 */

const UITranslator = {
  translate: function (exerciseType) {
    'use strict'
    const language = LogEXSession.getLanguage()
    const exampleExercises = config.exampleExercises[exerciseType]
    $('#button-' + language).addClass('active')

    $('#ok-top').html("<i class='fas fa-check'></i> " + Resources.getText(language, 'send'))
    $('#ok-bottom').html("<i class='fas fa-check'></i> " + Resources.getText(language, 'send'))
    $('#show-next-step').html(Resources.getText(language, 'step'))
    $('#showderivation').html("<i class='fas fa-key'> </i> " + Resources.getText(language, 'showderivation'))
    $('#derivationdone').html("<i class='fas fa-check'></i> " + Resources.getText(language, 'derivationdone'))
    $('#add-step-top').html("<i class='icon-sort-down'></i> " + Resources.getText(language, 'add-step-top'))
    $('#add-step-bottom').html("<i class='icon-sort-up'></i> " + Resources.getText(language, 'add-step-bottom'))
    $('#new-exercise').html(Resources.getText(language, 'new-exercise'))
    $('#generate-exercise-easy').html(Resources.getText(language, 'exeasy'))
    $('#generate-exercise-normal').html(Resources.getText(language, 'exnormal'))
    $('#generate-exercise-difficult').html(Resources.getText(language, 'exhard'))
    $('#new-exercise').html(Resources.getText(language, 'new-exercise'))

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

    $('#step-validation-switch-label').html(Resources.getText(language, 'stepvalidation'))
  }
}

const EXERCISE_TYPE = 'exerciseType'
const START = 'START'
const RULE_LISTBOX_TOP = '#rule-top'
const RULE_LISTBOX_BOTTOM = '#rule-bottom'
const FORMULA1 = '#formula1'
const FORMULA2 = '#formula2'
const EXERCISE = '#exercise'
const EXERCISE_LEFT_FORMULA = '#exercise-left-formula'
const EXERCISE_RIGHT_FORMULA = '#exercise-right-formula'
const EXERCISE_ADDED_STEP = '.exercise-step-added'
const EXERCISE_BOTTOM_STEPS = '#exercise-steps div.exercise-step-added-bottom'
const EXERCISE_TOP_STEPS = '#exercise-steps div.exercise-step-added-top'
const EXERCISE_LAST_STEP = '#exercise-steps div.last-step'
const NEW_EXERCISE_CONTENT = '#new-exercise-content'

const TOP = 'top'
const ERROR = 'error'
const SUCCESS = 'success'
const DIV_TOOLTIP_ERROR = "<div class='tooltip error'><div class='tooltip-arrow'></div><div class='tooltip-inner'></div></div>"
const SHOW = 'show'
const DESTROY = 'dispose'
const ERROR_TIMEOUT = 5000

class TwoWayController extends LogExController {
  constructor () {
    super()

    this.exerciseGenerator = new TwoWayExerciseGenerator()
    this.exerciseSolver = new TwoWayExerciseSolver()
    this.exerciseValidator = new TwoWayExerciseValidator()
    this.syntaxValidator = new SyntaxValidator()

    // user interface bindings
    $('#lang-NL').click(function () {
      LogEXSession.setLanguage('NL')
      this.initializeLabels()
      this.initializeRules()
      $('#button-NL').addClass('active')
      $('#button-EN').removeClass('active')
    })

    $('#lang-EN').click(function () {
      LogEXSession.setLanguage('EN')
      this.initializeLabels()
      this.initializeRules()
      $('#button-EN').addClass('active')
      $('#button-NL').removeClass('active')
    })

    $('#generate-exercise').click(function () {
      if (config.randomExercises) {
        this.generateExercise()
      }
    }.bind(this))

    $('#validate-step-top').click(function () {
      $(FORMULA1).popover(DESTROY)
      $(FORMULA2).popover(DESTROY)
      $('.retryFormula').popover(DESTROY)
      this.validateStep(true)
    }.bind(this))

    $('#validate-step-bottom').click(function () {
      $(FORMULA1).popover(DESTROY)
      $(FORMULA2).popover(DESTROY)
      $('.retryFormula').popover(DESTROY)
      this.validateStep(false)
    }.bind(this))

    $('body').on('click', 'button.remove-top-step', function () {
      $(FORMULA1).popover(DESTROY)
      $(FORMULA2).popover(DESTROY)
      $('.retryFormula').popover(DESTROY)
      this.removeTopStep($(this))
    })

    $('body').on('click', 'button.remove-bottom-step', function () {
      $(FORMULA1).popover(DESTROY)
      $(FORMULA2).popover(DESTROY)
      $('.retryFormula').popover(DESTROY)
      this.removeBottomStep($(this))
    })

    $('body').on('focusout', '.retryFormula', function () {
      this.retryFormula($(this))
    })

    $('body').on('focusout', '.retryRule', function () {
      this.retryRule($(this))
    })

    $(RULE_LISTBOX_TOP).change(function () {
      this.clearErrors()
    }.bind(this))

    $(RULE_LISTBOX_BOTTOM).change(function () {
      this.clearErrors()
    }.bind(this))

    $('body').on('focus', FORMULA1, function () {
      $(FORMULA1).popover(DESTROY)
      $(FORMULA2).popover(DESTROY)
      $('.retryFormula').popover(DESTROY)
    })
    $('body').on('focus', FORMULA2, function () {
      $(FORMULA1).popover(DESTROY)
      $(FORMULA2).popover(DESTROY)
      $('.retryFormula').popover(DESTROY)
    })

    $(FORMULA1).bind('paste cut', function () {
      setTimeout(function () {
        $(FORMULA1).kbinput('tidy')
        $(FORMULA2).kbinput('undo')
        $('#equivsign').attr('src', 'img/equivsign.png')
        $(FORMULA1).removeClass('error')
        $(FORMULA1).tooltip(DESTROY)
      }, 100)
    })

    $('body').on('focus', '.retryFormula', function () {
      $(FORMULA1).popover(DESTROY)
      $(FORMULA2).popover(DESTROY)
      $('.retryFormula').popover(DESTROY)
      $('.retryFormula').popover('hide')
    })

    $(FORMULA2).bind('paste cut', function () {
      setTimeout(function () {
        $(FORMULA2).kbinput('tidy')
        $(FORMULA1).kbinput('undo')
        $('#equivsign').attr('src', 'img/equivsign.png')
        $(FORMULA2).removeClass('error')
        $(FORMULA2).tooltip(DESTROY)
      }, 100)
    })

    $('#add-step-top-button').click(function () {
      $('#active-step-top').show()
      $('#active-step-bottom').hide()
      $('#add-step-top-button').hide()

      // toon de hint/next-step button
      if (config.displayHintButton) {
        $('#show-hint').show()
      }
      if (config.displayNextStepButton) {
        $('#show-next-step').show()
      }
      $('#add-step-bottom-button').show()

      // 20140430
      $(FORMULA2).val($('#formula2original').val())

      // verberg de hint popover als we van richting wisselen
      // formula.popover(DESTROY);
      $(FORMULA1).popover(DESTROY)
      $(FORMULA2).popover(DESTROY)
    })

    $('#add-step-bottom-button').click(function () {
      $('#active-step-bottom').show()
      $('#active-step-top').hide()
      $('#add-step-bottom-button').hide()

      // toon de hint/next-step button
      if (config.displayHintButton) {
        $('#show-hint').show()
      }
      if (config.displayNextStepButton) {
        $('#show-next-step').show()
      }

      // verberg de hint popover als we van richting wisselen
      // formula.popover(DESTROY);
      $(FORMULA1).popover(DESTROY)
      $(FORMULA2).popover(DESTROY)

      $('#add-step-top-button').show()

      // 20140430
      $(FORMULA1).val($('#formula1original').val())

      // $(FORMULA2).val(this.exercise.getCurrentStep().equation.formula2);
    })
  }

  /**
      Creates the popover for the input of symbols
    */
  initializeInput () {
    const formulaOptions1 = {
      id: 1,
      characters: this.characterOptions
    }
    const formulaOptions2 = {
      id: 2,
      characters: this.characterOptions
    }
    this.formulaPopover1 = new FormulaPopover(document.getElementById('formula1'), document.getElementById('formula1-wrapper'), formulaOptions1)
    this.formulaPopover2 = new FormulaPopover(document.getElementById('formula2'), document.getElementById('formula2-wrapper'), formulaOptions2)
  }

  /**
        Gets the exercisetype as given in the querystring
    */
  getExerciseType () {
    const sPageURL = window.location.search.substring(1)
    const sURLVariables = sPageURL.split('&')
    for (let i = 0; i < sURLVariables.length; i++) {
      const sParameterName = sURLVariables[i].split('=')
      if (sParameterName[0] === EXERCISE_TYPE) {
        this.exerciseType = sParameterName[1]
        return
      }
    }
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
  initializeRules () {
    const language = LogEXSession.getLanguage()
    let previousRule = START // For unification of the Rules list
    let rule

    // Clear ruleset if already set
    $(RULE_LISTBOX_TOP).find('option').remove().end()
    $(RULE_LISTBOX_BOTTOM).find('option').remove().end()

    for (rule in Rules) {
      // NB: Rule will only be displayed if it has not already been displayed
      if (Object.prototype.hasOwnProperty.call(Rules, rule) && Resources.getRule(language, rule) !== previousRule) {
        $('<option/>').val(rule).html(Resources.getRule(language, rule)).appendTo(RULE_LISTBOX_TOP)
        $('<option/>').val(rule).html(Resources.getRule(language, rule)).appendTo(RULE_LISTBOX_BOTTOM)
        previousRule = Resources.getRule(language, rule)
      }
    }
  }

  /**
        Shows an error message.

        @param element - The DOM element
        @param {string} toolTipText - The error message
        @param {string} placement - The placement of the error message (top | bottom | left | right)
     */
  showErrorToolTip (element, toolTipText, placement) {
    if (placement === undefined) {
      placement = TOP
    }
    element.addClass(ERROR)
    element.tooltip({
      title: toolTipText,
      placement: placement,
      template: DIV_TOOLTIP_ERROR
    })
    element.tooltip(SHOW)

    // vervelende tooltips verwijderen na 5 seconden, dan hebben gebruikers ze wel gezien
    setTimeout(this.clearErrors, ERROR_TIMEOUT)
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
    const selectedRuleTranslation = Resources.getRule(language, selectedRule)

    for (rule in Rules) {
      ruleTranslation = Resources.getRule(language, rule)
      if (previousRule !== ruleTranslation) {
        renderedCombobox += ("<option value='" + rule + "'")
        if (ruleTranslation === selectedRuleTranslation) {
          renderedCombobox += ' selected'
        }
        renderedCombobox += '>' + ruleTranslation + '</option>'
        previousRule = ruleTranslation
      }
    }
    return renderedCombobox
  }

  /**
        Clears all errors on the screen.
     */
  clearErrors () {
    $(FORMULA1).removeClass(ERROR)
    $(FORMULA2).removeClass(ERROR)
    $(RULE_LISTBOX_TOP).removeClass(ERROR)
    $(RULE_LISTBOX_BOTTOM).removeClass(ERROR)

    $(FORMULA1).removeClass(SUCCESS)
    $(FORMULA2).removeClass(SUCCESS)

    $(FORMULA1).tooltip(DESTROY)
    $(FORMULA2).tooltip(DESTROY)
    $(RULE_LISTBOX_TOP).tooltip(DESTROY)
    $(RULE_LISTBOX_BOTTOM).tooltip(DESTROY)

    $('#equivsign').tooltip(DESTROY)
    $('#new-exercise-dropdown').tooltip(DESTROY)
    $('#show-next-step').tooltip(DESTROY)
    $('#show-next-step').removeClass(ERROR)
    $('#show-hint').tooltip(DESTROY)
    $('#validate-exercise').removeClass(ERROR)
    $('#validate-exercise').tooltip(DESTROY)

    $('#validate-step-top').tooltip(DESTROY)
    $('#validate-step-bottom').tooltip(DESTROY)

    $('#equivsign').attr('src', 'img/equivsign.png')
  }

  /**
        Zebra stripes the proof steps.

        @param rows - The proof step rows
     */
  colorRows (rows) {
    if (!rows) {
      this.colorRows($('.exercise-step-added-top'))
      this.colorRows($($('.exercise-step-added-bottom').get().reverse()))
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

    $(FORMULA1).popover(DESTROY)
    $(FORMULA1).blur()
    $(FORMULA1).val('')
    $(FORMULA2).popover(DESTROY)
    $(FORMULA2).blur()
    $(FORMULA2).val('')
    $(EXERCISE).hide()
    $(EXERCISE_LEFT_FORMULA).html('')
    $(EXERCISE_RIGHT_FORMULA).html('')
    $(EXERCISE_ADDED_STEP).remove()
    $(EXERCISE_BOTTOM_STEPS).remove()
    $(EXERCISE_TOP_STEPS).remove()
    $(EXERCISE_LAST_STEP).remove()

    if ($(NEW_EXERCISE_CONTENT)) {
      $(NEW_EXERCISE_CONTENT).remove()
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
    const stepValidation = document.getElementById('step-validation-switch').checked

    this.reset()
    $('#show-hint').hide()
    $('#show-next-step').hide()
    this.disableUI(true)
    const language = LogEXSession.getLanguage()
    $('#newexercise').html(Resources.getText(language, 'exercise') + ' ' + (exnr + 1))
    this.exerciseGenerator.example(exnr, this.exerciseType, stepValidation, this.onExerciseGenerated.bind(this), this.onErrorGeneratingExercise.bind(this))
  }

  /**
        Generates an exercise.
     */
  generateExercise () {
    const stepValidation = document.getElementById('step-validation-switch').checked

    this.reset()
    $('#show-hint').hide()
    $('#show-next-step').hide()
    this.disableUI(true)
    const language = LogEXSession.getLanguage()
    $('#newexercise').html(Resources.getText(language, 'newexercise'))
    this.exerciseGenerator.generate(this.exerciseType, stepValidation, this.onExerciseGenerated.bind(this), this.onErrorGeneratingExercise.bind(this))
  }

  /**
        Shows the form for creating a new exercise
     */
  newExercise () {
    this.reset()
    $('#show-hint').hide()
    $('#show-next-step').hide()
    $('#bottom').hide()
    $('#exercise-steps').hide()

    const newExerciseTemplate = $('#new-exercise-template')
    const newExerciseHtml = newExerciseTemplate.render()

    $(newExerciseHtml).insertBefore('#exercise-steps')
    $('#create-exercise-button-content').html("<i class='icon-ok'></i> " + Resources.getText(LogEXSession.getLanguage(), 'create-exercise-button'))
    $(FORMULA1).focus()
    $('#create-exercise-button').click(function () {
      this.createExercise()
    }.bind(this))

    const language = LogEXSession.getLanguage()
    $('#newexercise').html(Resources.getText(language, 'newexercise'))
    $('#create-exercise-button-content').html("<i class='icon-ok'></i> " + Resources.getText(LogEXSession.getLanguage(), 'create-exercise-button'))
  }

  /**
        Creates a new exercise
     */
  createExercise () {
    const formula1 = $(FORMULA1).val()
    const formula2 = $(FORMULA2).val()
    const stepValidation = document.getElementById('step-validation-switch').checked

    // if (formula1 === formula2) {
    //    this.showErrorToolTip($('#equivsign'), Resources.getSpecificMessage(LogEXSession.getLanguage(), "identical"));
    //    return false;
    // }

    const equation = new Equation()
    const exerciseMethod = Resources.getExerciseMethod(this.exerciseType)
    equation.setFormula1(formula1)
    equation.setFormula2(formula2)
    this.exercise = new TwoWayExercise(equation.getText(), exerciseMethod, stepValidation)

    // this.exerciseSolver.solve(this.exercise, this.onNewExerciseValidated, this.onErrorCreatingExercise);
    this.exerciseGenerator.create(this.exerciseType, stepValidation, this.exercise.equation.getText(), this.onExerciseGenerated.bind(this), this.onErrorCreatingExercise.bind(this))
  }

  /**
        Handles the error that an exercise can not be created
     */
  onErrorCreatingExercise (errorMessage) {
    let syntaxError,
      column

    switch (errorMessage) {
      case 'Not suitable':
        this.showErrorToolTip($('#equivsign'), Resources.getSpecificMessage(LogEXSession.getLanguage(), errorMessage))
        break
      case 'Is ready':
        this.showErrorToolTip($('#equivsign'), Resources.getSpecificMessage(LogEXSession.getLanguage(), 'identical'))
        break
      default:
        syntaxError = errorMessage.split(':')[1].replace('\\n', ' ').replace('\\8594', '→').replace('\\8596', '↔').replace('\\8743', '∧').replace('\\8744', '∨').replace('\\172', '¬').replace('\\', '').replace('nexpecting', ', expecting')
        column = errorMessage.split(':')[0].split(',')[1].replace(')', '').replace('column', '').trim() - 4
        if (column <= $(FORMULA1).val().length) {
          this.showErrorToolTip($(FORMULA1), syntaxError)
        } else {
          this.showErrorToolTip($(FORMULA2), syntaxError)
        }
    }
  }

  /**
        Handles the event that an exercise is validated after the user has chosen to create a new exercise
     */
  /* this.onNewExerciseValidated = function (solution) {

        this.clearErrors();
        var lastStep = solution.getCurrentStep();
        if (lastStep.equation.formula1 !== lastStep.equation.formula2) {
            // de nieuwe oefening kan niet opgelost worden door de strategie
            this.showErrorToolTip($('#equivsign'), Resources.getSpecificMessage(LogEXSession.getLanguage(), "not-equivalent"));
            $('#equivsign').attr("src", "img/equivsignerr.png");

            return;
        }

        this.onExerciseGenerated(this.exercise);
    }; */

  /**
        Handles the event that an exercise is generated
     */
  onExerciseGenerated (exercise) {
    this.exercise = exercise
    this.clearErrors()

    $('#exercise-steps').show()
    if ($(NEW_EXERCISE_CONTENT)) {
      $(NEW_EXERCISE_CONTENT).remove()
    }

    document.getElementById('exercise-left-formula').innerHTML = exercise.equation.formula1katex
    document.getElementById('exercise-right-formula').innerHTML = exercise.equation.formula2katex

    $(FORMULA1).val(exercise.equation.formula1)
    // $(FORMULA1).kbinput('setPreviousValue', $(FORMULA1).val())
    $('#formula1original').val($(FORMULA1).val())
    $(FORMULA2).val(exercise.equation.formula2)
    // $(FORMULA2).kbinput('setPreviousValue', $(FORMULA2).val())
    $('#formula2original').val($(FORMULA2).val())
    this.exercise = exercise

    this.disableUI(false)
    $('#active-step-top').show()
    $('#active-step-bottom').show()
    $(EXERCISE).show()
    $('#exercise-steps').show()
    if (config.displayDerivationButton) {
      $('#solve-exercise').show()
    }
    $('#validate-exercise').show()
    $(EXERCISE_RIGHT_FORMULA).show()
    $('#bottom').show()
    $('#equivsign').attr('src', 'img/equivsign.png')

    // When using hotkeys focus on formula field must be reset
    $(FORMULA1).blur()
    $('#formula2').blur()
    $(FORMULA1).focus()

    // Reset rules value at start
    $(RULE_LISTBOX_TOP).val('')
    $(RULE_LISTBOX_BOTTOM).val('')

    document.getElementById('step-validation-switch').checked = true

    $('#active-step-bottom').hide()
    $('#active-step-top').hide()
    $('#add-step-bottom-button').show()
    $('#add-step-top-button').show()
  }

  /**
        Handles the error that an exercise can not generated
     */
  onErrorGeneratingExercise () {
    this.disableUI(false)
    this.showErrorToolTip($('#new-exercise-dropdown'), Resources.getSpecificMessage(LogEXSession.getLanguage(), 'error-generating-exercise'), 'right')
  }

  showSolution () {
    window.open('twowaysolution.html?formula=' + this.exercise.equation.getText() + '&exerciseType=' + this.exercise.type, '_blank', 'location=no,width=1020,height=600,status=no,toolbar=no')
  }

  // exercise solving
  // this.exerciseSolver = new TwoWayExerciseSolver();

  /**
        Solves the exercise
     */
  /* this.solveExercise = function () {
        this.disableUI(true);
        this.exerciseSolver.solve(this.exercise, this.onExerciseSolved, this.onErrorSolvingExercise);
    };
    */

  /**
        Handles the event that an exercise is solved
        @param {TwoWayStepCollection} solution - The solution
     */
  /* this.onExerciseSolved = function (solution) {
        $('#active-step').hide();
        $(BTN_SOLVEEXERCISE).hide();
        $('#validate-exercise').hide();
        $(EXERCISE_BOTTOM_STEPS).remove();
        $(EXERCISE_TOP_STEPS).remove();
        $(EXERCISE_LAST_STEP).remove();
        $(FORMULA1).blur();
        $(FORMULA2).blur();

        var lastStep = null;
        jQuery.each(solution.steps, function (index) {
            lastStep = this;
            this.insertStep(this, false);
        });
        if (lastStep) {
            this.insertLastStep(lastStep);
        }
        this.disableUI(false);
    };
*/
  /**
        Handles the error that an exercise can not be solved
     */
  /*   this.onErrorSolvingExercise = function () {
        this.showErrorToolTip($(BTN_SOLVEEXERCISE), Resources.getSpecificMessage(LogEXSession.getLanguage(), "error-solving-exercise"), "right");
        this.disableUI(false);
    };
   */

  /**
        Shows the next step
     */
  // this.showNextStep = function () {
  //    this.disableUI(true);
  //    this.exerciseSolver.solveNextStep(this.exercise, this.onNextStepSolved, this.onErrorSolvingNextStep);
  // };

  showNextStep () {
    this.dummyExercise = new TwoWayExercise(this.exercise.equation.getText(), this.exercise.type, false)
    this.dummyExercise.steps.push(new TwoWayStep(this.exercise.getCurrentStep().equation.getText(), ''))
    this.disableUI(true)

    if (!this.exercise.usesStepValidation && this.exercise.steps.steps.length > 1) {
      // this.exerciseValidator.validateStep(this.exercise.type, this.dummyExercise.getPreviousStep(), this.dummyExercise.getCurrentStep(), this.showNextStepWithoutStepValidation, this.onErrorSolvingNextStep);
      this.exerciseSolver.solveNextStep(this.exercise, this.onNextStepSolved.bind(this), this.onErrorSolvingNextStep.bind(this))
    } else {
      this.exerciseSolver.solveNextStep(this.exercise, this.onNextStepSolved.bind(this), this.onErrorSolvingNextStep.bind(this))

      // this.exerciseSolver.solveNextStep(this.exercise, this.GetStepsRemaining, this.onErrorSolvingNextStep);
    }
  }

  showNextStepWithoutStepValidation () {
    if (this.dummyExercise.getCurrentStep().isValid || this.dummyExercise.getCurrentStep().isCorrect) {
      this.exerciseSolver.solveNextStep(this.exercise, this.onNextStepSolved.bind(this), this.onErrorSolvingNextStep.bind(this))

      // this.exerciseSolver.solveNextStep(this.exercise, this.this.GetStepsRemaining, this.onErrorSolvingNextStep);
    } else {
      this.disableUI(false)
      this.showErrorToolTip($('#show-next-step'), Resources.getSpecificMessage(LogEXSession.getLanguage(), 'error-solving-next-stap-inv'))
    }
  }

  /**
        Handles the event that the next step of an exercise is solved
        @param {TwoWayStep} nextStep - The next step
     */
  onNextStepSolved (nextStep) {
    this.exercise.steps.push(nextStep)

    nextStep.isValid = true
    nextStep.isRuleValid = true

    // Reset rule value after valid step
    $('#rule').val('')
    this.getStepsRemaining(this.exercise.type, this.exercise.getCurrentStep())
    if (this.exercise.usesStepValidation) {

      // this.exerciseValidator.validateStep(this.exercise.type, this.exercise.getPreviousStep(), this.exercise.getCurrentStep(), this.onStepValidated, this.onErrorValidatingStep);
      // this.exerciseValidator.validateStep(this.exercise.type, this.exercise.getPreviousStep(), this.exercise.getCurrentStep(), this.getStepsRemaining, this.onErrorValidatingStep);

    } else {

      // this.onStepValidated();
      // this.getStepsRemaining(this.exercise.type,this.exercise.getCurrentStep());
    }
  }

  /**
        Handles the error that the next step can not be solved
     */
  onErrorSolvingNextStep () {
    this.showErrorToolTip($('#show-next-step'), Resources.getSpecificMessage(LogEXSession.getLanguage(), 'error-solving-next-step'))
  }

  /**
        Shows the hint
     */
  showHint () {
    this.exerciseSolver.getHelpForNextStep(this.exercise, this.onHelpForNextStepFound.bind(this), this.onErrorGettingHelpForNextStep.bind(this))
  }

  /**
        Handles the event that help for a next step is found
        @param {TwoWayStep} nextProofStep - The next proof step
     */
  onHelpForNextStepFound (nextProofStep) {
    $(FORMULA1).popover(DESTROY)
    $(FORMULA2).popover(DESTROY)

    const language = LogEXSession.getLanguage()
    let helpText = Resources.getText(language, 'nohint')
    let formula = $(FORMULA1)
    const step = this.exercise.getCurrentStep()
    const state = [this.exercise.type, step.strategyStatus, step.equation.getText(), step.strategyLocation]

    // formula is nodig om te weten waar de popover getoond moet worden
    if ($(FORMULA1).is(':visible')) {
      formula = $(FORMULA1)
    } else {
      formula = $(FORMULA2)
    }

    // het kan echter zijn dat formule die bewerkt moet worden in de volgende stap
    // juist de andere formule is (die niet zichtbaar is)
    // geef afhankelijk van de situatie een passende hint

    if ($(FORMULA1).is(':visible') && nextProofStep.isBottomStep) {
      helpText = Resources.getSpecificMessage(language, 'do-bottom-up-step')
    } else if ($(FORMULA2).is(':visible') && nextProofStep.isTopStep) {
      helpText = Resources.getSpecificMessage(language, 'do-top-down-step')
    } else if (Rules[nextProofStep.rule] !== null) {
      helpText = '<div id="hint1">' + Resources.getSpecificMessage(language, 'rewritethis') + '<br/><a href="#" id="toggle-hint1">» ' + Resources.getText(language, 'nexthint') + '</a></div>'
    }

    // overbodig?
    // if (nextProofStep.isBottomStep) {
    //    formula = $(FORMULA2);
    // }

    formula.popover({
      trigger: 'manual',
      placement: 'top',
      title: 'Hint',
      content: helpText,
      html: true
    })
    formula.popover('show')

    $('#toggle-hint1').on('click', function () {
      formula.popover(DESTROY)
      helpText = '<div id="hint2">' + Resources.getUseRuleMessage(language, nextProofStep.rule) + '<br/><a href="#" id="toggle-hint2">» ' + Resources.getText(language, 'nexthint') + '</a></div>'
      formula.popover({
        trigger: 'manual',
        placement: 'top',
        title: 'Hint',
        content: helpText,
        html: true
      })
      formula.popover('show')

      // Log hint
      IdeasServiceProxy.log(state, 'Hint: useRule')

      $('#toggle-hint2').on('click', function () {
        formula.popover(DESTROY)

        const oldFormula = formula.val()
        let newFormula = nextProofStep.equation.formula1

        if (nextProofStep.isBottomStep) {
          newFormula = nextProofStep.equation.formula2
        }

        helpText = '<div id="hint3">' + Resources.getFullHintMessage(language, nextProofStep.rule, showdiff(true, newFormula, oldFormula)) + ' <button type="button" id="auto-step" class="btn btn-success pull-right">' + Resources.getText(language, 'dostep') + '</button></div>'
        formula.popover({
          trigger: 'manual',
          placement: 'top',
          title: 'Hint',
          content: helpText,
          html: true
        })
        formula.popover('show')

        $('#auto-step').on('click', function () {
          $(FORMULA1).popover(DESTROY)
          $(FORMULA2).popover(DESTROY)
          this.disableUI(true)
          this.showNextStep()
        })

        // Log hint
        IdeasServiceProxy.log(state, 'Hint: rewriteThisUsing')
      })
    })
  }

  /**
        Handles the error that the next step can not be solved
     */
  onErrorGettingHelpForNextStep () {
    this.showErrorToolTip($('#show-hint'), Resources.getSpecificMessage(LogEXSession.getLanguage(), 'error-showing-hint'))
  }

  /**
        Validates a step

     */
  validateStep (isTopStep) {
    let ruleListBox
    if (isTopStep) {
      ruleListBox = RULE_LISTBOX_TOP
    } else {
      ruleListBox = RULE_LISTBOX_BOTTOM
    }

    if ($(ruleListBox).val() === '' && this.exercise.usesStepValidation) {
      // this.showErrorToolTip($(RULE_LISTBOX), Resources.getSpecificMessage(LogEXSession.getLanguage(), "no-rule"));
      this.showErrorToolTip($(ruleListBox), Resources.getSpecificMessage(LogEXSession.getLanguage(), 'no-rule'))
      return false
    }

    const changed = $('#formula1original').val() !== $(FORMULA1).val() || $('#formula2original').val() !== $(FORMULA2).val()

    if (!changed) {
      this.showErrorToolTip($('#equivsign'), Resources.getSpecificMessage(LogEXSession.getLanguage(), 'not-changed'))
      return false
    }

    // this.validateFormulas(this.onFormulasValidatedBeforeValidatingStep);
    this.disableUI(true)
    this.onFormulasValidatedBeforeValidatingStep(isTopStep)
  }

  /**
        Handles the event that the formulas are syntax validated before validating the step

     */
  onFormulasValidatedBeforeValidatingStep (isTopStep) {
    let ruleListBox
    if (isTopStep) {
      ruleListBox = RULE_LISTBOX_TOP
    } else {
      ruleListBox = RULE_LISTBOX_BOTTOM
    }

    // if (!this.isFormula1Valid || !this.isFormula2Valid) {
    //   // foutmeldingen worden al getoond in validateFormulas
    //   return false
    // }

    this.clearErrors()

    // this.exercise.steps.push(new TwoWayStep($(FORMULA1).val() + "==" + $(FORMULA2).val(), $(RULE_LISTBOX).val()));
    this.exercise.steps.push(new TwoWayStep($(FORMULA1).val() + '==' + $(FORMULA2).val(), $(ruleListBox).val()))

    if (this.exercise.usesStepValidation) {
      // this.exerciseValidator.validateStep(this.exercise.type, this.exercise.getPreviousStep(), this.exercise.getCurrentStep(), this.onStepValidated, this.onErrorValidatingStep);
      this.exerciseValidator.validateStep(this.exercise, false, this.exercise.getPreviousStep(), this.exercise.getCurrentStep(), this.getStepsRemaining.bind(this), this.onErrorValidatingStep.bind(this))
    } else {
      // this.onStepValidated();
      this.getStepsRemaining(this.exercise.type, this.exercise.getCurrentStep())
    }
  }

  /**
        Validates an exercise
     */
  validateExercise () {
    const step = this.exercise.getCurrentStep()
    const state = [this.exercise.type, step.strategyStatus, step.equation.getText(), step.strategyLocation]
    this.disableUI(true)
    if (this.exercise.usesStepValidation) {
      if (this.exercise.isReady) {
        $('#active-step-top').hide()
        $('#active-step-bottom').hide()
        $('#bottom').hide()
        $(FORMULA1).blur()
        $(FORMULA2).blur()

        $('.close').each(function () {
          $(this).hide()
        })

        const stepTemplate = $('#exercise-last-step-template')
        const exerciseStepHtml = stepTemplate.render({
          leftformula: $(FORMULA1).val(),
          rightformula: $(FORMULA2).val() //,
          // "stepsremaining": 123
        })

        $('#active-step-top').before(exerciseStepHtml)
        this.disableUI(false)

        // Log the check ready event
        IdeasServiceProxy.log(state, 'Ready: true (call)')
      } else {
        this.clearErrors()
        $(FORMULA1).addClass('error')
        $(FORMULA2).addClass('error')
        this.disableUI(false)

        this.showErrorToolTip($('#equivsign'), Resources.getSpecificMessage(LogEXSession.getLanguage(), 'incomplete'))

        // Log the check ready event
        IdeasServiceProxy.log(state, 'Ready: false (call)')
      }
    } else {
      this.exerciseValidator.validateExercise(this.exercise, 0, 0, this.onExerciseValidated.bind(this), this.onErrorExerciseValidate.bind(this))
    }
  }

  onExerciseValidated () {
    let i = 0
    let isReady = false
    let completelyCorrect = true

    this.reset()

    this.onExerciseGenerated(this.exercise)

    $.each(this.exercise.steps.steps, function () {
      if (this.isTopStep || this.isBottomStep) {
        let rule = ''
        let stepTemplate
        let error = ''

        if (this.isTopStep) {
          stepTemplate = $('#exercise-top-step-template')
        } else {
          stepTemplate = $('#exercise-bottom-step-template')
        }

        if (this.rule !== undefined && this.rule !== '') {
          rule = Resources.getRule(LogEXSession.getLanguage(), this.rule)
        }

        if (i > 0 && !this.isValid && completelyCorrect === true) {
          completelyCorrect = false
        }

        if (!this.isSyntaxValid && this.exercise.usesStepValidation) {
          error = Resources.getInvalidFormulaMessage()
        } else if (!this.isRuleValid && this.exercise.usesStepValidation) {
          error = Resources.getSpecificMessage(LogEXSession.getLanguage(), 'wrongrule')
        } else if (this.isCorrect && this.exercise.usesStepValidation) {
          error = Resources.getSpecificMessage(LogEXSession.getLanguage(), 'correctnotval')
        } else if (this.isSimilar && this.exercise.usesStepValidation) {
          error = Resources.getSpecificMessage(LogEXSession.getLanguage(), 'similar')
        } else if (this.isBuggy && this.exercise.usesStepValidation) {
          error = Resources.getMessageForBuggyRule(LogEXSession.getLanguage(), this.buggyRule)
        }

        const exerciseStepHtml = stepTemplate.render({
          rule: rule,
          leftformula: this.equation.formula1katex,
          rightformula: this.equation.formula2katex,
          canDelete: true,
          isWrong: !this.isValid || this.isCorrect,
          hasRule: this.rule !== undefined,
          step: i,
          ruleCombobox: this.renderRuleCombobox(this.rule),
          stepValidation: false,
          error: error,
          stepsremaining: ''
        })

        if (this.isTopStep) {
          $('#active-step-top').before(exerciseStepHtml)
        } else {
          $('#active-step-bottom').after(exerciseStepHtml)
        }

        if (this.isReady && !isReady && completelyCorrect === true) {
          isReady = true
          this.insertLastStep(this)
        }

        if (!this.isRuleValid && i > 0) {
          this.initializeRules($('#rule' & i))
        }
      }
      i++
    })

    $('#formula1').val(this.exercise.getCurrentStep().equation.formula1)
    // $('#formula1').kbinput('setPreviousValue', $('#formula1').val())
    $('#formula1original').val($('#formula1').val())

    $('#formula2').val(this.exercise.getCurrentStep().equation.formula2)
    // $('#formula2').kbinput('setPreviousValue', $('#formula2').val())
    $('#formula2original').val($('#formula2').val())

    this.colorRows()
    $('#formula1').blur()
    $('#formula2').blur()
    // $('.retryFormula').kbinput('hide')

    this.disableUI(false)

    if (!isReady) {
      this.showErrorToolTip($('#validate-exercise'), Resources.getSpecificMessage(LogEXSession.getLanguage(), 'incomplete'))
    }
  }

  onErrorExerciseValidate () {

    // TODO: MAIL VAN RENE OVERNEMEN this.showErrorToolTip($('#formula'), Recourses.getText(LogEXSession.getLanguage(),'error-validating-step'));
  }

  // here we set the number of steps that remain for step2
  getStepsRemaining (exercise) {
    // const that = step2

    // [BHR] disable the service call to stepsremaining. Instead, we use the
    // empty string. It would be better to remove the 'stepsremaining' field
    // in the user interface.
    // that.stepsRemaining = ''

    // when useStepValidiation is false (in the config), there is no prior check
    // to see if the step is correct. Hence, disable the automatic 'proof is
    // 'finished' feature when clicking 'Send' button.
    if (this.exercise.usesStepValidation) {
      this.setReady()
    }
    this.onStepValidated()

    /*

    var onError = function (jqXHR, textStatus, errorThrown) {
      // something went wrong, we have no idea howmany are left
      that.stepsRemaining="?";
      this.onStepValidated();
      },
    onSuccess = function (data) {
      // set the number of steps left in the Exercise Step
      that.stepsRemaining = data.result;
      this.onStepValidated();
      };

  //[["logic.dnf", "[]", "~(~x || ~y)", ""]]
  var theExerciseMethod = exerciseTypes.LOGEQ,
    input = {
      "source": "LogEX",
      "method": "stepsremaining",
      "params": [ [theExerciseMethod, step2.strategyStatus, step2.equation.getText(), ""]],
      "id": LogEXSession.getStudentId()
      };
  // IdeasServiceProxy.post(input, onSuccess, onError);

  */
  }

  /**
        Checks if the exercise is ready
     */
  setReady () {
    const step = this.exercise.getCurrentStep()
    const state = [this.exercise.type, step.strategyStatus, step.equation.getText(), step.strategyLocation]
    if (!step.isReady) {
      step.isReady = step.equation.getEquationIsSolved()
    }

    // Log the ready event
    if (step.isReady) {
      IdeasServiceProxy.log(state, 'Ready: true (no call)')
    }
  }

  /**
        Handles the event that a step is validated

     */
  onStepValidated () {
    this.clearErrors()
    const currentStep = this.exercise.getCurrentStep()
    let ruleListBox

    if (currentStep.isTopStep) {
      ruleListBox = RULE_LISTBOX_TOP
    } else {
      ruleListBox = RULE_LISTBOX_BOTTOM
    }

    document.getElementById('step-validation-switch').checked = false

    if (!currentStep.isValid && this.exercise.usesStepValidation) {
      let message = Resources.getSpecificMessage(LogEXSession.getLanguage(), 'wrongstep')
      this.exercise.steps.pop()

      if (!currentStep.isSyntaxValid && this.exercise.usesStepValidation) {
        message = Resources.getInvalidFormulaMessage()
        if (currentStep.isTopStep) {
          this.showErrorToolTip($(FORMULA1), Resources.getInvalidFormulaMessage(LogEXSession.getLanguage()))
        } else {
          this.showErrorToolTip($(FORMULA2), Resources.getInvalidFormulaMessage(LogEXSession.getLanguage()))
        }
        this.disableUI(false)
        return
      }

      if (!currentStep.isRuleValid && this.exercise.usesStepValidation) {
        this.showErrorToolTip($(ruleListBox), Resources.getSpecificMessage(LogEXSession.getLanguage(), 'wrongrule'))
        this.disableUI(false)
        return
      }

      // if (this.exercise.isCorrect) {
      if (currentStep.isCorrect && this.exercise.usesStepValidation) {
        if (currentStep.isTopStep) {
          this.showErrorToolTip($(FORMULA1), Resources.getSpecificMessage(LogEXSession.getLanguage(), 'correctnotval'))
        } else {
          this.showErrorToolTip($(FORMULA2), Resources.getSpecificMessage(LogEXSession.getLanguage(), 'correctnotval'))
        }
        this.disableUI(false)
        return
      }

      // if (this.exercise.isSimilar) {
      if (currentStep.isSimilar && this.exercise.usesStepValidation) {
        this.showErrorToolTip($('#equivsign'), Resources.getSpecificMessage(LogEXSession.getLanguage(), 'similar'))
        this.disableUI(false)
        return
      }

      // if (this.exercise.isBuggy) {
      if (currentStep.isBuggy && this.exercise.usesStepValidation) {
        message = Resources.getMessageForBuggyRule(LogEXSession.getLanguage(), currentStep.buggyRule)
      }

      if (currentStep.isTopStep) {
        this.showErrorToolTip($(FORMULA1), message)
      } else {
        this.showErrorToolTip($(FORMULA2), message)
      }

      $('#equivsign').attr('src', 'img/equivsignerr.png')

      //    Reset rule value after valid step
      $(RULE_LISTBOX_TOP).val('')
      $(RULE_LISTBOX_BOTTOM).val('')

      this.disableUI(false)
      return
    }

    this.clearErrors()

    // bij auto step is formula1 nog niet goed gevuld
    // $(FORMULA1).val(this.exercise.getCurrentStep().equation.formula1);
    $(FORMULA1).val(currentStep.equation.formula1)
    // $(FORMULA1).kbinput('setPreviousValue', $(FORMULA1).val())
    $('#formula1original').val($(FORMULA1).val())

    // bij auto step is formula2 nog niet goed gevuld
    $(FORMULA2).val(currentStep.equation.formula2)
    // $(FORMULA2).kbinput('setPreviousValue', $(FORMULA2).val())
    $('#formula2original').val($(FORMULA2).val())

    this.insertStep(currentStep, true)
    if (currentStep.isReady) {
      this.insertLastStep(currentStep)
    }

    this.disableUI(false)

    // Bij het gebruik van hotkeys moet de focus van het formula veld worden reset
    if ($(FORMULA1).is(':focus')) {
      $(FORMULA1).blur()
      $(FORMULA1).focus()
    } else if ($(FORMULA2).is(':focus')) {
      $(FORMULA2).blur()
      $(FORMULA2).focus()
    }

    //    Reset rule value after valid step
    $(RULE_LISTBOX_TOP).val('')
    $(RULE_LISTBOX_BOTTOM).val('')
  }

  /**
        Handles the error that the step can not be validated
     */
  onErrorValidatingStep (isTopStep) {
    let validateButton
    if (isTopStep) {
      validateButton = '#validate-step-top'
    } else {
      validateButton = '#validate-step-bottom'
    }

    this.disableUI(false)

    // this.showErrorToolTip($(BTN_VALIDATESTEP), Resources.getSpecificMessage(LogEXSession.getLanguage(), "error-validating-step"));
    this.showErrorToolTip($(validateButton), Resources.getSpecificMessage(LogEXSession.getLanguage(), 'error-validating-step'))
  }

  // rvl: niet meer nodig, wordt niet meer gebruikt
  /**
        Validates the formulas

        @param onFormulasValidated - The callback function
     */
  // this.validateFormulas = function (onFormulasValidated) {
  //    this.clearErrors();
  //
  //    //this.validateFormula($(FORMULA1).val(), function (isValid, formulaText) {
  //    //    this.onFormula1Validated(isValid, formulaText, onFormulasValidated);
  //    //});
  // };

  /**
        Handles the event that formula 1 is validated

        @param {Boolean} isValid - True if valid, false otherwise
        @param {String} formulaText - The text of the formula
        @param onFormulasValidated - The callback function
     */
  onFormula1Validated (isValid, formulaText, onFormulasValidated) {
    this.onFormulaValidated(isValid, formulaText)
    this.validateFormula($(FORMULA2).val(), function (isValid, formulaText) {
      this.onFormula2Validated(isValid, formulaText, onFormulasValidated)
    }.bind(this))
  }

  /**
        Handles the event that formula 2 is validated

        @param {Boolean} isValid - True if valid, false otherwise
        @param {String} formulaText - The text of the formula
        @param onFormulasValidated - The callback function
     */
  onFormula2Validated (isValid, formulaText, onFormulasValidated) {
    this.onFormulaValidated(isValid, formulaText)
    onFormulasValidated()
  }

  /**
        Validates the formula

        @param formula - The DOM element that contains the formula
        @param onFormulasValidated - The callback function
     */
  validateFormula (formula, callback) {
    if (typeof callback === 'undefined') {
      callback = this.onFormulaValidated.bind(this)
    }

    this.syntaxValidator.validateSyntax(formula, callback)
  }

  /**
        Handles the event that a formula is validated

        @param {Boolean} isValid - True if the formula is valid, false otherwise
        @param {String} formulaText - The text of the formula
     */
  onFormulaValidated (isValid, formulaText) {
    if (!isValid) {
      let formula = $(FORMULA1)
      if ($(FORMULA1).val() !== formulaText) {
        formula = $(FORMULA2)
      }

      this.showErrorToolTip(formula, Resources.getSpecificMessage(LogEXSession.getLanguage(), 'invalidformula'), 'bottom')
    }

    if ($(FORMULA1).val() === formulaText) {
      this.isFormula1Valid = isValid
    } else {
      this.isFormula2Valid = isValid
    }
  }

  /**
        Inserts a proof step

        @param {TwoWayStep} step - The proof step
        @param {Boolean} canDelete - True if the proof step can be deleted, false otherwise
     */
  insertStep (step, canDelete) {
    // dit is de start opgave
    if (!step.isTopStep && !step.isBottomStep) {
      return
    }

    const rule = Resources.getRule(LogEXSession.getLanguage(), step.rule)
    let stepTemplate
    let error

    // todo
    // error boodschap bepalen aan de hand van step

    if (step.isTopStep) {
      stepTemplate = $('#exercise-top-step-template')
    } else {
      stepTemplate = $('#exercise-bottom-step-template')
    }

    const exerciseStepHtml = stepTemplate.render({
      error: error,
      rule: rule,
      leftformula: step.equation.formula1katex,
      rightformula: step.equation.formula2katex,
      canDelete: canDelete,
      isWrong: false,
      hasRule: this.rule !== undefined,
      step: 1,
      stepValidation: true,
      stepsremaining: step.stepsRemaining
    })

    if (step.isTopStep) {
      $('#active-step-top').before(exerciseStepHtml)
    } else {
      $('#active-step-bottom').after(exerciseStepHtml)
    }

    this.colorRows()
  }

  /**
        Inserts the last proof step

        @param {TwoWayStep} step - The proof step
     */
  insertLastStep (step) {
    const stepTemplate = $('#exercise-last-step-template')
    const exerciseStepHtml = stepTemplate.render({
      leftformula: step.equation.formula1katex,
      rightformula: step.equation.formula2katex
    })

    $('#active-step-top').before(exerciseStepHtml)
    $('#active-step-top').hide()
    $('#active-step-bottom').hide()
    $('#bottom').hide()
    $(FORMULA1).blur()
    $(FORMULA2).blur()

    this.clearErrors()

    $('.remove-top-step').hide()
    $('.remove-bottom-step').hide()

    $('#active-step-top').hide()
    $('#active-step-bottom').hide()
    $('#add-step-top-button').hide()
    $('#add-step-bottom-button').hide()

    document.getElementById('step-validation-switch').checked = true
  }

  /**
        Removes the top steps, starting at the specified source index

        @param source - The source DOM element
     */
  removeTopStep (source) {
    this.clearErrors()
    const parent = source.parents('div.exercise-step-added-top')
    const allExerciseSteps = $(EXERCISE_TOP_STEPS)
    const index = allExerciseSteps.index(parent)
    const step = this.exercise.getCurrentStep()
    const state = [this.exercise.type, step.strategyStatus, step.equation.getText(), step.strategyLocation]

    this.exercise.steps.removeTopSteps(index)

    allExerciseSteps.slice(index).remove()

    $(FORMULA1).val(this.exercise.getCurrentStep().equation.formula1)
    // $(FORMULA1).kbinput('setPreviousValue', $(FORMULA1).val())
    $('#formula1original').val($(FORMULA1).val())
    $(FORMULA2).val(this.exercise.getCurrentStep().equation.formula2)
    // $(FORMULA2).kbinput('setPreviousValue', $(FORMULA2).val())
    $('#formula2original').val($(FORMULA2).val())
    this.colorRows()

    // Bij het gebruik van hotkeys moet de focus van het formula veld worden reset
    if ($(FORMULA1).is(':focus')) {
      $(FORMULA1).blur()
      $(FORMULA1).focus()
    } else if ($(FORMULA2).is(':focus')) {
      $(FORMULA2).blur()
      $(FORMULA2).focus()
    }

    // Log the use of undo
    IdeasServiceProxy.log(state, 'undo')
  }

  retryFormula (source) {
    const index = source.attr('data-step')
    const editStep = this.exercise.steps.steps[index]

    if (editStep.isTopStep) {
      editStep.equation.formula1 = source.val()
    } else {
      editStep.equation.formula2 = source.val()
    }
  }

  retryRule (source) {
    const index = source.attr('data-step')
    const editStep = this.exercise.steps.steps[index]

    editStep.rule = source.val()
  }

  /**
        Removes the bottom steps, starting at the specified source index

        @param source - The source DOM element
     */
  removeBottomStep (source) {
    this.clearErrors()
    const parent = source.parents('div.exercise-step-added-bottom')
    const allExerciseSteps = $(EXERCISE_BOTTOM_STEPS)
    const index = (allExerciseSteps.length - allExerciseSteps.index(parent) - 1)
    const step = this.exercise.getCurrentStep()
    const state = [this.exercise.type, step.strategyStatus, step.equation.getText(), step.strategyLocation]
    this.exercise.steps.removeBottomSteps(index)

    allExerciseSteps.slice(0, allExerciseSteps.index(parent) + 1).remove()

    $(FORMULA1).val(this.exercise.getCurrentStep().equation.formula1)
    // $(FORMULA1).kbinput('setPreviousValue', $(FORMULA1).val())
    $('#formula1original').val($(FORMULA1).val())
    $(FORMULA2).val(this.exercise.getCurrentStep().equation.formula2)
    // $(FORMULA2).kbinput('setPreviousValue', $(FORMULA2).val())
    $('#formula2original').val($(FORMULA2).val())
    this.colorRows()

    // Bij het gebruik van hotkeys moet de focus van het formula veld worden reset
    if ($(FORMULA1).is(':focus')) {
      $(FORMULA1).blur()
      $(FORMULA1).focus()
    } else if ($(FORMULA2).is(':focus')) {
      $(FORMULA2).blur()
      $(FORMULA2).focus()
    }

    // Log the use of undo
    IdeasServiceProxy.log(state, 'undo')
  }

  changeStepValidation (stepValidation) {
    if (this.exercise) {
      this.exercise.usesStepValidation = stepValidation
    }
  }
}
