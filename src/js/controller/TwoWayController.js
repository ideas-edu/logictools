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
import { TwoWayExerciseGenerator } from '../model/twoway/exerciseGenerator.js'
import { TwoWayExerciseSolver } from '../model/twoway/exerciseSolver.js'
import { TwoWayExerciseValidator } from '../model/twoway/exerciseValidator.js'
import { TwoWayStep } from '../model/twoway/step.js'
import { SyntaxValidator } from '../model/syntaxValidator.js'
import { Rules } from '../model/rules.js'
import { IdeasServiceProxy } from '../model/ideasServiceProxy.js'
import { showdiff } from '../showdiff.js'
import { translate, loadLanguage } from '../translate.js'

jsrender($) // load JsRender jQuery plugin methods

function ready (fn) {
  if (document.readyState !== 'loading') {
    fn()
  } else {
    document.addEventListener('DOMContentLoaded', fn)
  }
}

function setUp () {
  const controller = new TwoWayController()
  controller.getExerciseType()
  window.UITranslate = function () {
    const language = LogEXSession.getLanguage()
    const langCallback = function () {
      controller.updateTexts()
    }
    loadLanguage(language, langCallback)
  }
  controller.initializeStepValidation()
  controller.initializeButtons()
  controller.initializeInput()
  controller.initializeLabels()
  controller.initializeRules(document.getElementById('rule'))
  controller.setExampleExercises()
  controller.bindExampleExercises()
}

ready(setUp)

class TwoWayController extends LogExController {
  constructor () {
    super()

    this.exerciseGenerator = new TwoWayExerciseGenerator()
    this.exerciseSolver = new TwoWayExerciseSolver()
    this.exerciseValidator = new TwoWayExerciseValidator()
    this.syntaxValidator = new SyntaxValidator()
    this.exerciseType = 'logeq'
    this.proofDirection = null

    $('#generate-exercise').click(function () {
      if (config.randomExercises) {
        this.generateExercise()
      }
    }.bind(this))
  }

  /**
        Creates the popover for the input of symbols
    */
  initializeInput () {
    const formulaOptions = {
      id: 1,
      characters: this.characterOptions
    }
    this.formulaPopover = new FormulaPopover(document.getElementById('formula'), document.getElementById('two-way-input'), formulaOptions)
  }

  /**
        Initializes all buttons and label to correct language
     */
  initializeLabels () {
    window.UITranslate()
  }

  updateTexts () {
    super.updateTexts()
    document.getElementById('exercise-title').innerHTML = translate('twoWay.title')
    if (this.exercise !== null) {
      document.getElementById('instruction').innerHTML = translate('twoWay.instruction.exercise', {
        topFormula: this.exercise.equation.formula1katex,
        bottomFormula: this.exercise.equation.formula2katex
      })
    } else {
      document.getElementById('instruction').innerHTML = translate('twoWay.instruction.begin')
    }
    document.getElementById('header-direction').innerHTML = translate('shared.header.direction')

    this.initializeRules(document.getElementById('rule'))
  }

  /**
        Resets the UI to its original state.
     */
  reset () {
    this.clearErrors()
  }

  /**
        Get an example exercise.
     */
  useExercise (exnr) {
    const properties = {
      stepValidation: true
    }

    super.useExercise(exnr, properties)
  }

  /**
        Generates an exercise.
     */
  generateExercise () {
    const stepValidation = true

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

    // if (formula1 === formula2) {
    //    this.showErrorToolTip($('#equivsign'), Resources.getSpecificMessage(LogEXSession.getLanguage(), "identical"));
    //    return false;
    // }

    // const equation = new Equation()
    // const exerciseMethod = Resources.getExerciseMethod(this.exerciseType)
    // equation.setFormula1(formula1)
    // equation.setFormula2(formula2)
    // this.exercise = new TwoWayExercise(equation.getText(), exerciseMethod, true)

    // // this.exerciseSolver.solve(this.exercise, this.onNewExerciseValidated, this.onErrorCreatingExercise);
    // this.exerciseGenerator.create(this.exerciseType, stepValidation, this.exercise.equation.getText(), this.onExerciseGenerated.bind(this), this.onErrorCreatingExercise.bind(this))
  }

  /**
        Handles the error that an exercise can not be created
     */
  onErrorCreatingExercise (errorMessage) {
    // let syntaxError,
    //   column

    // switch (errorMessage) {
    //   case 'Not suitable':
    //     this.showErrorToolTip($('#equivsign'), Resources.getSpecificMessage(LogEXSession.getLanguage(), errorMessage))
    //     break
    //   case 'Is ready':
    //     this.showErrorToolTip($('#equivsign'), Resources.getSpecificMessage(LogEXSession.getLanguage(), 'identical'))
    //     break
    //   default:
    //     syntaxError = errorMessage.split(':')[1].replace('\\n', ' ').replace('\\8594', '→').replace('\\8596', '↔').replace('\\8743', '∧').replace('\\8744', '∨').replace('\\172', '¬').replace('\\', '').replace('nexpecting', ', expecting')
    //     column = errorMessage.split(':')[0].split(',')[1].replace(')', '').replace('column', '').trim() - 4
    //     if (column <= $(FORMULA1).val().length) {
    //       this.showErrorToolTip($(FORMULA1), syntaxError)
    //     } else {
    //       this.showErrorToolTip($(FORMULA2), syntaxError)
    //     }
    // }
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

    stepRow = exerciseStepTable.lastElementChild
    while (true) {
      if (stepRow.classList.contains('exercise-step')) {
        exerciseStepTable.removeChild(stepRow)
        stepRow = exerciseStepTable.lastElementChild
      } else {
        break
      }
    }

    document.getElementById('header-actions').style.display = ''

    // Insert first row
    this.insertStep(this.exercise.steps.topSteps[0], false)
    this.insertStep(this.exercise.steps.bottomSteps[0], false)

    document.getElementById('instruction').innerHTML = translate('twoWay.instruction.exercise', {
      topFormula: this.exercise.equation.formula1katex,
      bottomFormula: this.exercise.equation.formula2katex
    })

    document.getElementById('active-step').style.display = ''

    $('#exercise-steps').show()
    if ($('#new-exercise-content')) {
      $('#new-exercise-content').remove()
    }

    this.disableUI(false)

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
    document.getElementById('rule').selectedIndex = 0

    // doh: zorg dat regelverantwoording niet undefined kan zijn
    this.exercise.usesRuleJustification = true // $('#rule-switch').bootstrapSwitch('state')

    // rvl: Check if rule justification is needed
    // if (this.exercise.usesRuleJustification) {
    //   $('#rule').show()
    // } else {
    //   $('#rule').hide()
    // }

    document.getElementById('step-validation-switch').disabled = false // $('#step-validation-switch').bootstrapSwitch('disabled', true) // true || false
    this.setProofDirection(null)
  }

  /**
        Handles the event that an exercise is generated
     */
  // onExerciseGenerated (exercise) {
  //   this.exercise = exercise
  //   this.clearErrors()

  //   $('#exercise-steps').show()
  //   if ($(NEW_EXERCISE_CONTENT)) {
  //     $(NEW_EXERCISE_CONTENT).remove()
  //   }

  //   // document.getElementById('exercise-left-formula').innerHTML = exercise.equation.formula1katex
  //   // document.getElementById('exercise-right-formula').innerHTML = exercise.equation.formula2katex

  //   // $(FORMULA1).val(exercise.equation.formula1)
  //   // // $(FORMULA1).kbinput('setPreviousValue', $(FORMULA1).val())
  //   // $('#formula1original').val($(FORMULA1).val())
  //   // $(FORMULA2).val(exercise.equation.formula2)
  //   // // $(FORMULA2).kbinput('setPreviousValue', $(FORMULA2).val())
  //   // $('#formula2original').val($(FORMULA2).val())
  //   // this.exercise = exercise

  //   // this.disableUI(false)
  //   // $('#active-step-top').show()
  //   // $('#active-step-bottom').show()
  //   // $(EXERCISE).show()
  //   // $('#exercise-steps').show()
  //   // if (config.displayDerivationButton) {
  //   //   $('#solve-exercise').show()
  //   // }
  //   // $('#validate-exercise').show()
  //   // $(EXERCISE_RIGHT_FORMULA).show()
  //   // $('#bottom').show()
  //   // $('#equivsign').attr('src', 'img/equivsign.png')

  //   // // When using hotkeys focus on formula field must be reset
  //   // $(FORMULA1).blur()
  //   // $('#formula2').blur()
  //   // $(FORMULA1).focus()

  //   // // Reset rules value at start
  //   // $(RULE_LISTBOX_TOP).val('')
  //   // $(RULE_LISTBOX_BOTTOM).val('')

  //   // document.getElementById('step-validation-switch').checked = true

  //   // $('#active-step-bottom').hide()
  //   // $('#active-step-top').hide()
  //   // $('#add-step-bottom-button').show()
  //   // $('#add-step-top-button').show()
  // }

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
    this.disableUI(true)
    this.exerciseSolver.solveNextStep(this.exercise, this.onNextStepSolved.bind(this), this.onErrorSolvingNextStep.bind(this))
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
    if (nextStep.isTopStep) {
      this.exercise.steps.pushTopStep(nextStep)
    } else {
      this.exercise.steps.pushBottomStep(nextStep)
    }

    this.insertStep(nextStep, true)
    this.disableUI(false) // UI hier terug enabled, anders worden de popovers verkeerd gepositioneerd.
    // nextStep.isValid = true
    // nextStep.isRuleValid = true

    // // Reset rule value after valid step
    // $('#rule').val('')
    // this.getStepsRemaining(this.exercise.type, this.getCurrentStep())
    // if (this.exercise.usesStepValidation) {

    //   // this.exerciseValidator.validateStep(this.exercise.type, this.exercise.getPreviousStep(), this.getCurrentStep(), this.onStepValidated, this.onErrorValidatingStep);
    //   // this.exerciseValidator.validateStep(this.exercise.type, this.exercise.getPreviousStep(), this.getCurrentStep(), this.getStepsRemaining, this.onErrorValidatingStep);

    // } else {

    //   // this.onStepValidated();
    //   // this.getStepsRemaining(this.exercise.type,this.getCurrentStep());
    // }
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
        @param {OneWayStep} nextOneWayStep - The next one way step
     */
  onHelpForNextStepFound (nextOneWayStep) {
    const rule = Rules[nextOneWayStep.rule]
    if (rule !== null) {
      const buttonCallback = function () {
        this.showNextHint(nextOneWayStep)
      }.bind(this)
      this.updateAlert('shared.hint.useRule', { rule: rule }, 'hint', 'shared.hint.nextHint', buttonCallback)
    } else {
      this.updateAlert('shared.hint.unavailable', null, 'hint')
    }
  }

  showNextHint (nextOneWayStep) {
    const formula = document.getElementById('formula')
    const oldFormula = formula.value
    const newFormula = nextOneWayStep.formula
    const formulaDiff = showdiff(true, newFormula, oldFormula)
    this.updateAlert('shared.hint.full', { rule: Rules[nextOneWayStep.rule], formula: formulaDiff }, 'hint', 'shared.hint.autoStep', this.showNextStep.bind(this))
  }

  /**
        Handles the event that help for a next step is found
        @param {TwoWayStep} nextProofStep - The next proof step
     */
  // onHelpForNextStepFound (nextProofStep) {
  //   $(FORMULA1).popover(DESTROY)
  //   $(FORMULA2).popover(DESTROY)

  //   const language = LogEXSession.getLanguage()
  //   let helpText = Resources.getText(language, 'nohint')
  //   let formula = $(FORMULA1)
  //   const step = this.getCurrentStep()
  //   const state = [this.exercise.type, step.strategyStatus, step.equation.getText(), step.strategyLocation]

  //   // formula is nodig om te weten waar de popover getoond moet worden
  //   if ($(FORMULA1).is(':visible')) {
  //     formula = $(FORMULA1)
  //   } else {
  //     formula = $(FORMULA2)
  //   }

  //   // het kan echter zijn dat formule die bewerkt moet worden in de volgende stap
  //   // juist de andere formule is (die niet zichtbaar is)
  //   // geef afhankelijk van de situatie een passende hint

  //   if ($(FORMULA1).is(':visible') && nextProofStep.isBottomStep) {
  //     helpText = Resources.getSpecificMessage(language, 'do-bottom-up-step')
  //   } else if ($(FORMULA2).is(':visible') && nextProofStep.isTopStep) {
  //     helpText = Resources.getSpecificMessage(language, 'do-top-down-step')
  //   } else if (Rules[nextProofStep.rule] !== null) {
  //     helpText = '<div id="hint1">' + Resources.getSpecificMessage(language, 'rewritethis') + '<br/><a href="#" id="toggle-hint1">» ' + Resources.getText(language, 'nexthint') + '</a></div>'
  //   }

  //   // overbodig?
  //   // if (nextProofStep.isBottomStep) {
  //   //    formula = $(FORMULA2);
  //   // }

  //   formula.popover({
  //     trigger: 'manual',
  //     placement: 'top',
  //     title: 'Hint',
  //     content: helpText,
  //     html: true
  //   })
  //   formula.popover('show')

  //   $('#toggle-hint1').on('click', function () {
  //     formula.popover(DESTROY)
  //     helpText = '<div id="hint2">' + Resources.getUseRuleMessage(language, nextProofStep.rule) + '<br/><a href="#" id="toggle-hint2">» ' + Resources.getText(language, 'nexthint') + '</a></div>'
  //     formula.popover({
  //       trigger: 'manual',
  //       placement: 'top',
  //       title: 'Hint',
  //       content: helpText,
  //       html: true
  //     })
  //     formula.popover('show')

  //     // Log hint
  //     IdeasServiceProxy.log(state, 'Hint: useRule')

  //     $('#toggle-hint2').on('click', function () {
  //       formula.popover(DESTROY)

  //       const oldFormula = formula.val()
  //       let newFormula = nextProofStep.equation.formula1

  //       if (nextProofStep.isBottomStep) {
  //         newFormula = nextProofStep.equation.formula2
  //       }

  //       helpText = '<div id="hint3">' + Resources.getFullHintMessage(language, nextProofStep.rule, showdiff(true, newFormula, oldFormula)) + ' <button type="button" id="auto-step" class="btn btn-success pull-right">' + Resources.getText(language, 'dostep') + '</button></div>'
  //       formula.popover({
  //         trigger: 'manual',
  //         placement: 'top',
  //         title: 'Hint',
  //         content: helpText,
  //         html: true
  //       })
  //       formula.popover('show')

  //       $('#auto-step').on('click', function () {
  //         $(FORMULA1).popover(DESTROY)
  //         $(FORMULA2).popover(DESTROY)
  //         this.disableUI(true)
  //         this.showNextStep()
  //       })

  //       // Log hint
  //       IdeasServiceProxy.log(state, 'Hint: rewriteThisUsing')
  //     })
  //   })
  // }

  /**
        Handles the error that the next step can not be solved
     */
  onErrorGettingHelpForNextStep () {
    this.showErrorToolTip($('#show-hint'), Resources.getSpecificMessage(LogEXSession.getLanguage(), 'error-showing-hint'))
  }

  /**
        Validates a step

     */
  validateStep () {
    const newFormula = document.getElementById('formula').value

    const ruleKey = this.getSelectedRuleKey()
    if (ruleKey === null && this.exercise.usesRuleJustification && this.exercise.usesStepValidation) {
      this.setErrorLocation('rule')
      this.updateAlert('shared.error.noRule', null, 'error')
      return false
    }

    if (this.proofDirection === 'down' && newFormula === this.exercise.steps.getCurrentTopStep().formula) {
      this.setErrorLocation('formula')
      this.updateAlert('shared.error.notChanged', null, 'error')
      return false
    }

    if (this.proofDirection === 'up' && newFormula === this.exercise.steps.getCurrentBottomStep().formula) {
      this.setErrorLocation('formula')
      this.updateAlert('shared.error.notChanged', null, 'error')
      return false
    }

    this.disableUI(true)
    this.clearErrors()

    let newStep = null
    let previousStep = null
    if (this.proofDirection === 'down') {
      newStep = new TwoWayStep(newFormula, ruleKey, 'top')
      previousStep = this.exercise.steps.getCurrentTopStep()
      this.exercise.steps.pushTopStep(newStep)
    } else {
      newStep = new TwoWayStep(newFormula, ruleKey, 'bottom')
      previousStep = this.exercise.steps.getCurrentBottomStep()
      this.exercise.steps.pushBottomStep(newStep)
    }

    if (this.exercise.usesStepValidation) {
      this.exerciseValidator.validateStep(this.exercise, this.exercise.usesRuleJustification, previousStep, newStep, this.onStepValidated.bind(this), this.onErrorValidatingStep.bind(this))
    } else {
      this.onStepValidated(newStep)
    }
  }

  checkCompleted () {
    if (!this.exercise.steps.isComplete()) {
      return
    }

    const elements = document.getElementsByClassName('step-actions')
    for (const element of elements) {
      element.style.display = 'none'
    }
    document.getElementById('header-actions').style.display = 'none'

    const arrow = katex.renderToString('\\Leftrightarrow', {
      throwOnError: false
    })

    const alertParams = {
      beginFormula: this.exercise.equation.formula1katex,
      endFormula: this.exercise.equation.formula2katex,
      arrow: arrow
    }
    this.updateAlert('twoWay.solution', alertParams, 'complete')
    this.setProofDirection('complete')
  }

  getCurrentStep () {
    if (this.proofDirection === 'down') {
      return this.exercise.steps.topSteps[this.exercise.steps.topSteps.length - 1]
    } else {
      return this.exercise.steps.bottomSteps[this.exercise.steps.bottomSteps.length - 1]
    }
  }

  removeCurrentStep () {
    if (this.proofDirection === 'down') {
      return this.exercise.steps.topSteps.pop()
    } else {
      return this.exercise.steps.bottomSteps.pop()
    }
  }

  /**
        Validates an exercise
     */
  validateExercise () {
    const step = this.getCurrentStep()
    const state = [this.exercise.type, step.strategyStatus, step.equation.getText(), step.strategyLocation]
    this.disableUI(true)
    if (this.exercise.usesStepValidation) {
      if (this.exercise.isReady) {
        $('#active-step-top').hide()
        $('#active-step-bottom').hide()
        $('#bottom').hide()

        $('.close').each(function () {
          $(this).hide()
        })

        const stepTemplate = $('#exercise-last-step-template')
        const exerciseStepHtml = stepTemplate.render({
        })

        $('#active-step-top').before(exerciseStepHtml)
        this.disableUI(false)

        // Log the check ready event
        IdeasServiceProxy.log(state, 'Ready: true (call)')
      } else {
        this.clearErrors()
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
          // this.initializeRules($('#rule' & i))
        }
      }
      i++
    })

    this.disableUI(false)

    if (!isReady) {
      this.showErrorToolTip($('#validate-exercise'), Resources.getSpecificMessage(LogEXSession.getLanguage(), 'incomplete'))
    }
  }

  /**
        Checks if the exercise is ready
     */
  setReady () {
    const step = this.getCurrentStep()
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
  onStepValidated (currentStep) {
    this.clearErrors()
    document.getElementById('formula').value = currentStep.formula

    document.getElementById('step-validation-switch').checked = false

    let message = null
    let errorLocation = null
    if (!currentStep.isValid && this.exercise.usesStepValidation) {
      message = 'shared.error.wrongStep'
      if (currentStep.isTopStep) {
        this.exercise.steps.topSteps.pop()
      } else {
        this.exercise.steps.bottomSteps.pop()
      }

      if (!currentStep.isSyntaxValid) { // Foutieve syntax
        message = 'shared.error.invalidFormula'
        errorLocation = 'formula'
      } else if (currentStep.isSimilar) { // Ongewijzigde formule
        message = 'shared.error.similar'
        errorLocation = 'formula'
      } else if (currentStep.isCorrect) { // Gemaakte stap is juist, maar onduidelijk wat de gebruiker heeft uitgevoerd
        message = 'shared.error.correctNotVal'
        errorLocation = 'formula'
      } else if (currentStep.isBuggy) { // Gemaakte stap is foutief, maar de strategie weet wat er fout is gegaan
        message = `buggyRule.${currentStep.buggyRule}`
        errorLocation = 'formula'
      } else if (!currentStep.isRuleValid) { // De ingegeven regel is niet correct
        message = 'shared.error.wrongRule'
        errorLocation = 'rule'
      } else if (!currentStep.isValid) {
        message = 'shared.error.wrongStep'
        errorLocation = 'formula'
      }

      this.disableUI(false) // disableUI(false) moet opgeroepen worden voordat de errorTooltip getoond wordt, anders wordt de tooltip te laag getoond (= hoogte van het wait-icoontje)
      this.setErrorLocation(errorLocation)
      this.updateAlert(message, null, 'error')
    } else {
      this.insertStep(currentStep, true)
      this.exercise.isReady = currentStep.isReady

      // bij auto step is formula nog niet goed gevuld
      document.getElementById('formula').value = currentStep.formula

      this.disableUI(false)

      //    Reset rule value after valid step
      document.getElementById('rule').selectedIndex = 0
    }
    // if (!currentStep.isValid && this.exercise.usesStepValidation) {
    //   let message = Resources.getSpecificMessage(LogEXSession.getLanguage(), 'wrongstep')
    //   this.removeCurrentStep()

    //   if (!currentStep.isSyntaxValid && this.exercise.usesStepValidation) {
    //     message = Resources.getInvalidFormulaMessage()
    //     if (currentStep.isTopStep) {
    //       this.showErrorToolTip($(FORMULA1), Resources.getInvalidFormulaMessage(LogEXSession.getLanguage()))
    //     } else {
    //       this.showErrorToolTip($(FORMULA2), Resources.getInvalidFormulaMessage(LogEXSession.getLanguage()))
    //     }
    //     this.disableUI(false)
    //     return
    //   }

    //   if (!currentStep.isRuleValid && this.exercise.usesStepValidation) {
    //     this.showErrorToolTip($(ruleListBox), Resources.getSpecificMessage(LogEXSession.getLanguage(), 'wrongrule'))
    //     this.disableUI(false)
    //     return
    //   }

    //   // if (this.exercise.isCorrect) {
    //   if (currentStep.isCorrect && this.exercise.usesStepValidation) {
    //     if (currentStep.isTopStep) {
    //       this.showErrorToolTip($(FORMULA1), Resources.getSpecificMessage(LogEXSession.getLanguage(), 'correctnotval'))
    //     } else {
    //       this.showErrorToolTip($(FORMULA2), Resources.getSpecificMessage(LogEXSession.getLanguage(), 'correctnotval'))
    //     }
    //     this.disableUI(false)
    //     return
    //   }

    //   // if (this.exercise.isSimilar) {
    //   if (currentStep.isSimilar && this.exercise.usesStepValidation) {
    //     this.showErrorToolTip($('#equivsign'), Resources.getSpecificMessage(LogEXSession.getLanguage(), 'similar'))
    //     this.disableUI(false)
    //     return
    //   }

    //   // if (this.exercise.isBuggy) {
    //   if (currentStep.isBuggy && this.exercise.usesStepValidation) {
    //     message = Resources.getMessageForBuggyRule(LogEXSession.getLanguage(), currentStep.buggyRule)
    //   }

    //   if (currentStep.isTopStep) {
    //     this.showErrorToolTip($(FORMULA1), message)
    //   } else {
    //     this.showErrorToolTip($(FORMULA2), message)
    //   }

    //   $('#equivsign').attr('src', 'img/equivsignerr.png')

    //   //    Reset rule value after valid step
    //   $(RULE_LISTBOX_TOP).val('')
    //   $(RULE_LISTBOX_BOTTOM).val('')

    //   this.disableUI(false)
    //   return
    // }

    // this.clearErrors()

    // // bij auto step is formula1 nog niet goed gevuld
    // // $(FORMULA1).val(this.getCurrentStep().equation.formula1);
    // // $(FORMULA1).val(currentStep.equation.formula1)
    // // $(FORMULA1).kbinput('setPreviousValue', $(FORMULA1).val())
    // // $('#formula1original').val($(FORMULA1).val())

    // // bij auto step is formula2 nog niet goed gevuld
    // // $(FORMULA2).val(currentStep.equation.formula2)
    // // $(FORMULA2).kbinput('setPreviousValue', $(FORMULA2).val())
    // // $('#formula2original').val($(FORMULA2).val())

    // this.insertStep(currentStep, true)
    // if (currentStep.isReady) {
    //   this.insertLastStep(currentStep)
    // }

    // this.disableUI(false)

    // // Bij het gebruik van hotkeys moet de focus van het formula veld worden reset
    // if ($(FORMULA1).is(':focus')) {
    //   $(FORMULA1).blur()
    //   $(FORMULA1).focus()
    // } else if ($(FORMULA2).is(':focus')) {
    //   $(FORMULA2).blur()
    //   $(FORMULA2).focus()
    // }

    // //    Reset rule value after valid step
    // $(RULE_LISTBOX_TOP).val('')
    // $(RULE_LISTBOX_BOTTOM).val('')
  }

  /**
        Handles the error that the step can not be validated
     */
  onErrorValidatingStep (isTopStep) {
    this.disableUI(false)
    this.setErrorLocation('validate-step')
    this.updateAlert('shared.error.validatingStep', null, 'error')
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

  }

  setProofDirection (direction) {
    this.proofDirection = direction
    const topBuffer = document.getElementById('empty-top-step')
    const bottomBuffer = document.getElementById('empty-bottom-step')
    const activeStep = document.getElementById('active-step')
    const activeArrow = document.getElementById('active-arrow')
    const activeEquiv = document.getElementById('active-equiv')

    if (direction === 'down') {
      topBuffer.style.display = 'none'
      bottomBuffer.style.display = ''
      activeStep.style.display = ''
      activeArrow.innerHTML = '<i class="fas fa-arrow-down"></i>'
      activeEquiv.style.display = ''
      document.getElementById('formula').value = this.exercise.steps.topSteps[this.exercise.steps.topSteps.length - 1].formula
      this.formulaPopover.previousValue = this.exercise.steps.topSteps[this.exercise.steps.topSteps.length - 1].formula
    }
    if (direction === 'up') {
      topBuffer.style.display = ''
      bottomBuffer.style.display = 'none'
      activeStep.style.display = ''
      activeArrow.innerHTML = '<i class="fas fa-arrow-up"></i>'
      activeEquiv.style.display = 'none'
      document.getElementById('formula').value = this.exercise.steps.bottomSteps[this.exercise.steps.bottomSteps.length - 1].formula
      this.formulaPopover.previousValue = this.exercise.steps.bottomSteps[this.exercise.steps.bottomSteps.length - 1].formula
    }
    if (direction === 'complete') {
      topBuffer.style.display = 'none'
      bottomBuffer.style.display = 'none'
      activeStep.style.display = 'none'
    }
    if (direction === null) {
      topBuffer.style.display = 'none'
      bottomBuffer.style.display = ''
      activeStep.style.display = 'none'
    }
  }

  /**
        Inserts a proof step

        @param {ProofStep} step - The proof step
        @param {Boolean} canDelete - True if the proof step can be deleted, false otherwise
     */
  insertStep (step, canDelete) {
    this.dismissAlert()

    const exerciseStep = document.createElement('tr')
    if (step.isTopStep) {
      this.setProofDirection('down')
      exerciseStep.classList.add('exercise-top-step')
    } else {
      this.setProofDirection('up')
      exerciseStep.classList.add('exercise-bottom-step')
    }
    exerciseStep.classList.add('exercise-step')
    exerciseStep.setAttribute('number', step.number)
    exerciseStep.innerHTML = this.renderStep(step, canDelete)

    if (canDelete) {
      const deleteButton = exerciseStep.getElementsByClassName('delete-step')[0]
      deleteButton.addEventListener('click', function () {
        if (step.isTopStep) {
          this.removeTopStep(step.number)
        } else {
          this.removeBottomStep(step.number)
        }
      }.bind(this))
    }

    // Move Top down/Bottom up button
    if (step.isTopStep) {
      const topDownButton = document.getElementById('top-step')
      if (topDownButton) {
        topDownButton.parentNode.removeChild(topDownButton)
      }
      const topBuffer = document.getElementById('empty-top-step')
      topBuffer.insertAdjacentElement('beforebegin', exerciseStep)
    } else {
      const bottomUpButton = document.getElementById('bottom-step')
      if (bottomUpButton) {
        bottomUpButton.parentNode.removeChild(bottomUpButton)
      }
      const bottomBuffer = document.getElementById('empty-bottom-step')
      bottomBuffer.insertAdjacentElement('afterend', exerciseStep)
    }

    this.formulaPopover.previousValue = step.formula
    if (step.isTopStep) {
      document.getElementById('top-step').innerHTML = translate('twoWay.button.topDown')
      document.getElementById('top-step').addEventListener('click', function () {
        this.setProofDirection('down')
      }.bind(this))
    } else {
      document.getElementById('bottom-step').innerHTML = translate('twoWay.button.bottomUp')
      document.getElementById('bottom-step').addEventListener('click', function () {
        this.setProofDirection('up')
      }.bind(this))
    }

    this.checkCompleted()
  }

  renderStep (step, canDelete) {
    let rule = ''
    let arrow = null
    const stepTemplate = $.templates('#exercise-step-template')
    const ruleKey = Rules[step.rule]

    if (step.rule !== undefined) {
      rule = translate(ruleKey)
    }

    arrow = katex.renderToString('\\Leftrightarrow', {
      throwOnError: false
    })

    const exerciseStepHtml = stepTemplate.render({
      rule: rule,
      ruleKey: ruleKey,
      formula: step.formulaKatex,
      canDelete: canDelete,
      topStep: step.isTopStep,
      bottomStep: step.isBottomStep,
      basis: step === this.exercise.steps.topSteps[0] || step === this.exercise.steps.bottomSteps[0],
      step: step.number,
      arrow: arrow,
      stepValidation: true,
      ruleJustification: true
    })

    return exerciseStepHtml
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
  removeTopStep (index) {
    if (index === 1) {
      // Don't remove base step
      return
    }

    const exerciseStepTable = document.getElementById('exercise-step-table')

    // Move top-down button
    const topDownButton = document.getElementById('top-step')
    for (let i = 0; i < exerciseStepTable.children.length; i++) {
      if (Number(exerciseStepTable.children[i].getAttribute('number')) === index - 1 && exerciseStepTable.children[i].classList.contains('exercise-top-step')) {
        const newTop = exerciseStepTable.children[i].getElementsByClassName('step-actions')[0]
        newTop.appendChild(topDownButton)
      }
    }

    for (let i = exerciseStepTable.children.length - 1; i >= 0; i--) {
      if (exerciseStepTable.children[i].getAttribute('number') >= index && exerciseStepTable.children[i].classList.contains('exercise-top-step')) {
        exerciseStepTable.removeChild(exerciseStepTable.children[i])
      }
    }
    this.exercise.steps.removeTopSteps(index - 1)
    if (this.proofDirection === 'down') {
      this.formulaPopover.previousValue = this.exercise.steps.topSteps[index - 2].formula
    }
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
  removeBottomStep (index) {
    if (index === 1) {
      // Don't remove base step
      return
    }

    const exerciseStepTable = document.getElementById('exercise-step-table')

    // Move bottomUp button
    const bottomUpButton = document.getElementById('bottom-step')
    for (let i = 0; i < exerciseStepTable.children.length; i++) {
      if (Number(exerciseStepTable.children[i].getAttribute('number')) === index - 1 && exerciseStepTable.children[i].classList.contains('exercise-bottom-step')) {
        const newBottom = exerciseStepTable.children[i].getElementsByClassName('step-actions')[0]
        newBottom.appendChild(bottomUpButton)
      }
    }

    for (let i = exerciseStepTable.children.length - 1; i >= 0; i--) {
      if (exerciseStepTable.children[i].getAttribute('number') >= index && exerciseStepTable.children[i].classList.contains('exercise-bottom-step')) {
        exerciseStepTable.removeChild(exerciseStepTable.children[i])
      }
    }
    this.exercise.steps.removeBottomSteps(index - 1)
    if (this.proofDirection === 'up') {
      this.formulaPopover.previousValue = this.exercise.steps.bottomSteps[index - 2].formula
    }
  }

  changeStepValidation (stepValidation) {
    if (this.exercise) {
      this.exercise.usesStepValidation = stepValidation
    }
  }
}
