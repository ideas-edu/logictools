/*global document, window, TwoWayController, TwoWayStep, jQuery, LogEXSession, Resources, $, KeyBindings, Rules, setTimeout, TwoWayExerciseGenerator, Equation, TwoWayExercise, TwoWayExerciseSolver, TwoWayExerciseValidator, SyntaxValidator*/
(function ($) {
    "use strict";
    // we can now rely on $ within the safety of our "bodyguard" function
    $(document).ready(function () {
        var controller = new TwoWayController();
        controller.getExerciseType();
		controller.initializeStepValidation();
		controller.initializeButtons();
		controller.setExampleExercises();
        controller.initializeLabels();
        controller.initializeRules();
		controller.bindExampleExercises();	
    if (config.randomExercises) {
		   controller.generateExercise();			
		} else {
		   controller.useExercise(0);	
		}
    });
}(jQuery));

/**
    TwoWayController is responsible for handling all user interaction and manipulation of the user interface.
    @constructor
 */

var UITranslator = {
        translate : function (exerciseType) {
            "use strict";
            var language = LogEXSession.getLanguage();
			var exampleExercises = config.exampleExercises[exerciseType];
            $("#button-" + language).addClass('active');

            $('#ok-top').html("<i class='icon-ok'></i> " + Resources.getText(language, "send"));
            $('#ok-bottom').html("<i class='icon-ok'></i> " + Resources.getText(language, "send"));
            $(BTN_SHOW_NEXT_STEP).html(Resources.getText(language, "step"));
            $('#showproof').html("<i class='icon-key'> </i> " + Resources.getText(language, "showproof"));
            $('#proofdone').html("<i class='icon-ok'></i> " + Resources.getText(language, "proofdone"));
            $('#add-step-top').html("<i class='icon-sort-down'></i> " + Resources.getText(language,"add-step-top"));
            $('#add-step-bottom').html("<i class='icon-sort-up'></i> " + Resources.getText(language,"add-step-bottom"));
            $(BTN_NEWEXERCISE).html("<i class='icon-refresh'></i> " + Resources.getText(language, "newexercise"));
            $('#generate-exercise-easy').html(Resources.getText(language, "exeasy"));
            $(BTN_GENERATEEXERCISENORMAL).html(Resources.getText(language, "exnormal"));
            $('#generate-exercise-difficult').html(Resources.getText(language, "exhard"));
            $('#new-exercise').html(Resources.getText(language, "new-exercise"));
			
			for (var i= 0; i < exampleExercises.length ; i++){				
				var nr = exampleExercises[i] + 1;			
				var id = 'exercise' + nr;							
				$('#' + id).html(Resources.getText(language, "exercise") + " " + nr);
			}	
			
            $('#help').html("<i class='icon-question-sign'></i> " + Resources.getText(language, "help"));
            $('#help').attr("href", "LogEX_manual_" + language + ".pdf").attr("target", "_new");
            $(BTN_LOGOUT).html("<i class='icon-signout'></i> " + Resources.getText(language, "logout"));
            if ($('#create-exercise-button-content') !== null) {
                $('#create-exercise-button-content').html("<i class='icon-ok'></i> " + Resources.getText(LogEXSession.getLanguage(), "create-exercise-button"));
            }
            
            $(LBL_STEPVALIDATION).html(Resources.getText(language, "stepvalidation"));
            $(SWITCH_VALIDATION).bootstrapSwitch(VAL_SETONLABEL, Resources.getText(language, "on")); // sets the text of the "on" label
            $(SWITCH_VALIDATION).bootstrapSwitch(VALSETOFFLABEL, Resources.getText(language, "off")); // sets the text of the "off" label
        }
    };

function TwoWayController() {
    "use strict";

    var self = this;
    
    var EXERCISE_TYPE           = "exerciseType";
    var START                   = "START";
    var RULE_LISTBOX_TOP        = "#rule-top";
    var RULE_LISTBOX_BOTTOM     = "#rule-bottom";
    var FORMULA1                = "#formula1";
    var FORMULA2                = "#formula2";
    var EXERCISE                = "#exercise";
    var EXERCISE_LEFT_FORMULA   = "#exercise-left-formula";
    var EXERCISE_RIGHT_FORMULA  = "#exercise-right-formula";
    var EXERCISE_ADDED_STEP     = ".exercise-step-added";
    var EXERCISE_BOTTOM_STEPS   = "#exercise-steps div.exercise-step-added-bottom";
    var EXERCISE_TOP_STEPS      = "#exercise-steps div.exercise-step-added-top";
    var EXERCISE_LAST_STEP      = "#exercise-steps div.last-step";
    var NEW_EXERCISE_CONTENT    = "#new-exercise-content";
    
    var UNDEFINED               = "undefined";
    var TOP                     = "top";
    var ERROR                   = "error";
    var SUCCESS                 = "success";
    var DIV_TOOLTIP_ERROR       = "<div class='tooltip error'><div class='tooltip-arrow'></div><div class='tooltip-inner'></div></div>";
    var SHOW                    = "show";
    var DESTROY                 = "destroy";
    var ERROR_TIMEOUT           = 5000;
    

    this.exerciseType = "";
    this.exercise = null;
    this.dummyExercise = null;
    this.isFormula1Valid = true;
    this.isFormula2Valid = true;
    this.keyBindings = new KeyBindings(this);
	this.exampleExercises = null;
    
    /**
        Gets the exercisetype as given in the querystring
    */
    this.getExerciseType = function () {
        var sPageURL = window.location.search.substring(1);
        var sURLVariables = sPageURL.split('&');
        for (var i = 0; i < sURLVariables.length; i++) 
        {
            var sParameterName = sURLVariables[i].split('=');
            if (sParameterName[0] == EXERCISE_TYPE) 
            {
                this.exerciseType = sParameterName[1];
                return;
            }
        }
    };
	
	/**
        Sets the example exercises
    */
    this.setExampleExercises = function () {
        this.exampleExercises = config.exampleExercises[self.exerciseType];	
		// inserts the example exercises
		for (var i=0; i < self.exampleExercises.length; i++){				
			var nr = self.exampleExercises[i] + 1;			
			var id = 'exercise' + nr;
			$('#new-exercise-menu').append('<li><a href="#" id="' + id + '"></a></li>');			
		}
		
		// inserts the randomly generated exercises
		if (config.randomExercises) {
		   $('#new-exercise-menu').append('<li class="divider"></li>');
		   $('#new-exercise-menu').append('<li><a href="#" id="' + 'generate-exercise-easy' + '"></a></li>');
		   $('#new-exercise-menu').append('<li><a href="#" id="' + 'generate-exercise-normal' + '"></a></li>');
		   $('#new-exercise-menu').append('<li><a href="#" id="' + 'generate-exercise-difficult' + '"></a></li>');
		}
		
		// inserts own input exercises
		if (config.inputOwnExercise) {
		   $('#new-exercise-menu').append('<li class="divider"></li>');
		   $('#new-exercise-menu').append('<li><a href="#" id="' + 'new-exercise' + '"></a></li>');
		}
    
    // installs event handlers
    $("#generate-exercise-easy").click(function () {
        LogEXSession.setDifficulty("easy");
        self.generateExercise();
    });

    $(BTN_GENERATEEXERCISENORMAL).click(function () {
        LogEXSession.setDifficulty("medium");
        self.generateExercise();
    });

    $("#generate-exercise-difficult").click(function () {
        LogEXSession.setDifficulty("difficult");
        self.generateExercise();
    });

    $("#new-exercise").click(function () {
        self.newExercise();
    });
    };
	
	 /**
        Initializes step validation
     */
    this.initializeStepValidation = function () {		
        $(SWITCH_VALIDATION).bootstrapSwitch('setState', config.useStepValidation);
		if(!config.displayStepValidation){
			$(LBL_STEPVALIDATION).hide();
			$(SWITCH_VALIDATION).hide();
		}			
    };
	
	 /**
        Initializes hint, next step and complete derivation button
     */
    this.initializeButtons = function () {        
		if(!config.displayHintButton){
			$(BTN_SHOWHINT).hide();			
		}
		if(!config.displayNextStepButton){
			$(BTN_SHOW_NEXT_STEP).hide();			
		}
		if(!config.displayDerivationButton){
			$(BTN_SHOWDERIVATION).hide();	
			$(BTN_SOLVEEXERCISE).hide();			
		}		
    };

    /**
        Initializes all buttons and label to correct language
        
     */
    this.initializeLabels = function () {
        UITranslator.translate(self.exerciseType);
    };

    /**
        Initializes drop down box for rules from Rules dictionary
        
     */
    this.initializeRules = function () {

        var language = LogEXSession.getLanguage(),
            previousRule = START, // For unification of the Rules list
            rule;
        // Clear ruleset if already set
        $(RULE_LISTBOX_TOP).find('option').remove().end();
        $(RULE_LISTBOX_BOTTOM).find('option').remove().end();

        for (rule in Rules) {
            // NB: Rule will only be displayed if it has not already been displayed
            if (Rules.hasOwnProperty(rule) && Resources.getRule(language, rule) !== previousRule) {
                $('<option/>').val(rule).html(Resources.getRule(language, rule)).appendTo(RULE_LISTBOX_TOP);
                $('<option/>').val(rule).html(Resources.getRule(language, rule)).appendTo(RULE_LISTBOX_BOTTOM);
                previousRule = Resources.getRule(language, rule);
            }
        }
    };

    /**
        Shows an error message.
                
        @param element - The DOM element
        @param {string} toolTipText - The error message
        @param {string} placement - The placement of the error message (top | bottom | left | right)
     */
    this.showErrorToolTip = function (element, toolTipText, placement) {
        if (typeof placement === UNDEFINED) {
            placement = TOP;
        }
        element.addClass(ERROR);
        element.tooltip({
            title: toolTipText,
            placement: placement,
            template: DIV_TOOLTIP_ERROR
        });
        element.tooltip(SHOW);

        // vervelende tooltips verwijderen na 5 seconden, dan hebben gebruikers ze wel gezien
        setTimeout(this.clearErrors, ERROR_TIMEOUT);
    };

    /**
        Gets the html code for an combobox to be used in the rendered step
    */
    this.renderRuleCombobox = function (selectedRule) {
        var language = LogEXSession.getLanguage(),
            previousRule = 'START',
            rule,
            ruleTranslation,
            renderedCombobox = "",
            selectedRuleTranslation = Resources.getRule(language, selectedRule);
            
        for (rule in Rules) {
            ruleTranslation = Resources.getRule(language, rule);
            if (previousRule !== ruleTranslation) {
                renderedCombobox += ("<option value='" + rule + "'");
                if (ruleTranslation === selectedRuleTranslation) {
                    renderedCombobox += " selected";
                }
                renderedCombobox += ">" + ruleTranslation + "</option>";
                previousRule = ruleTranslation;
            }
        }
        return renderedCombobox;
    };
    
    
    /**
        Clears all errors on the screen.
     */
    this.clearErrors = function () {

        $(FORMULA1).removeClass(ERROR);
        $(FORMULA2).removeClass(ERROR);
        $(RULE_LISTBOX_TOP).removeClass(ERROR);
        $(RULE_LISTBOX_BOTTOM).removeClass(ERROR);

        $(FORMULA1).removeClass(SUCCESS);
        $(FORMULA2).removeClass(SUCCESS);

        $(FORMULA1).tooltip(DESTROY);
        $(FORMULA2).tooltip(DESTROY);
        $(RULE_LISTBOX_TOP).tooltip(DESTROY);
        $(RULE_LISTBOX_BOTTOM).tooltip(DESTROY);
        
        $('#equivsign').tooltip(DESTROY);
        $('#new-exercise-dropdown').tooltip(DESTROY);
        $(BTN_SOLVEEXERCISE).tooltip(DESTROY);
        $(BTN_SHOW_NEXT_STEP).tooltip(DESTROY);
        $(BTN_SHOW_NEXT_STEP).removeClass(ERROR);
        $(BTN_SHOWHINT).tooltip(DESTROY);
        $('#validate-exercise').removeClass(ERROR);
        $('#validate-exercise').tooltip(DESTROY);
        
        $('#validate-step-top').tooltip(DESTROY);
        $('#validate-step-bottom').tooltip(DESTROY);

        $('#equivsign').attr("src", "img/equivsign.png");
    };

    /**
        Zebra stripes the proof steps.
                
        @param rows - The proof step rows
     */
    this.colorRows = function (rows) {
        if (!rows) {
            this.colorRows($('.exercise-step-added-top'));
            this.colorRows($($('.exercise-step-added-bottom').get().reverse()));
            return;
        }

        var toggle = -1;
        
        
        rows.each(function () {
            if (toggle < 0) {
                $(this).addClass('oneven');
            } else {
                $(this).removeClass('oneven');
            }
            toggle = toggle * -1;
        });
    };

    /**
        Resets the UI to its original state.
     */
    this.reset = function () {
        this.clearErrors();

        $(FORMULA1).popover(DESTROY);
        $(FORMULA1).blur();
        $(FORMULA1).val('');
        $(FORMULA2).popover(DESTROY);
        $(FORMULA2).blur();
        $(FORMULA2).val('');
        $(EXERCISE).hide();
        $(EXERCISE_LEFT_FORMULA).html("");
        $(EXERCISE_RIGHT_FORMULA).html("");
        $(EXERCISE_ADDED_STEP).remove();
        $(EXERCISE_BOTTOM_STEPS).remove();
        $(EXERCISE_TOP_STEPS).remove();
        $(EXERCISE_LAST_STEP).remove();

        if ($(NEW_EXERCISE_CONTENT)) {
            $(NEW_EXERCISE_CONTENT).remove();
        }
    };
    
    this.disableUI = function(disable) {
        $(":input").attr("disabled",disable);

        if (disable){
            $('#wait-exercise').show();
        } else {
            $('#wait-exercise').hide();
        }
    };

    // exercise generation
    this.exerciseGenerator = new TwoWayExerciseGenerator();
	
	/**
        Get an example exercise.
     */
    this.useExercise = function (exnr) {
        var stepValidation = $(SWITCH_VALIDATION).bootstrapSwitch('status'); // true || false
        this.reset();
		$(BTN_SHOWHINT).hide();
		$(BTN_SHOW_NEXT_STEP).hide();
        this.disableUI(true);
        var language = LogEXSession.getLanguage();
        $('#newexercise').html(Resources.getText(language, "exercise") + " " + (exnr+1));
        this.exerciseGenerator.example(exnr, this.exerciseType, stepValidation, this.onExerciseGenerated, this.onErrorGeneratingExercise);
    };

    /**
        Generates an exercise.
     */
    this.generateExercise = function () {
        var stepValidation = $(SWITCH_VALIDATION).bootstrapSwitch('status'); // true || false
        this.reset();
		$(BTN_SHOWHINT).hide();
		$(BTN_SHOW_NEXT_STEP).hide();
        this.disableUI(true);
		var language = LogEXSession.getLanguage();
		$('#newexercise').html(Resources.getText(language, "newexercise"));
        this.exerciseGenerator.generate(this.exerciseType, stepValidation, this.onExerciseGenerated, this.onErrorGeneratingExercise);
    };

    /**
        Shows the form for creating a new exercise
     */
    this.newExercise = function () {
        this.reset();
		$(BTN_SHOWHINT).hide();
		$(BTN_SHOW_NEXT_STEP).hide();
        $('#bottom').hide();
        $('#exercise-steps').hide();

        var newExerciseTemplate = $('#new-exercise-template'),
            newExerciseHtml = newExerciseTemplate.render();

        $(newExerciseHtml).insertBefore('#exercise-steps');
        $('#create-exercise-button-content').html("<i class='icon-ok'></i> " + Resources.getText(LogEXSession.getLanguage(), "create-exercise-button"));
        $(FORMULA1).focus();
        $("#create-exercise-button").click(function () {
            self.createExercise();
        });
        $(FORMULA1).bind('paste cut', function () {
            setTimeout(function () {
                $(FORMULA1).kbinput('tidy');
                $('#equivsign').attr("src", "img/equivsign.png");
                $(FORMULA1).removeClass('error');
                $(FORMULA1).tooltip(DESTROY);
            }, 100);
        });

        $(FORMULA2).bind('paste cut', function () {
            setTimeout(function () {
                $(FORMULA2).kbinput('tidy');
                $('#equivsign').attr("src", "img/equivsign.png");
                $(FORMULA2).removeClass('error');
                $(FORMULA2).tooltip(DESTROY);
            }, 100);
        });

        $(FORMULA1).kbinput({
            chars: 'logic',
            onValueChanged: function (e) {
                $('#equivsign').attr("src", "img/equivsign.png");
                $('#equivsign').tooltip(DESTROY);
                $(FORMULA1).removeClass('error');
                $(FORMULA1).tooltip(DESTROY);
            }
        });

        $(FORMULA2).kbinput({
            chars: 'logic',
            onValueChanged: function (e) {
                $('#equivsign').attr("src", "img/equivsign.png");
                $('#equivsign').tooltip(DESTROY);
                $(FORMULA2).removeClass('error');
                $(FORMULA2).tooltip(DESTROY);
            }
        });
        
		var language = LogEXSession.getLanguage();
		$('#newexercise').html(Resources.getText(language, "newexercise"));
        $('#create-exercise-button-content').html("<i class='icon-ok'></i> " + Resources.getText(LogEXSession.getLanguage(), "create-exercise-button"));
    };
    
    // exercise creation
    this.exerciseCreator = new TwoWayExerciseCreator();

    /**
        Creates a new exercise
     */
    this.createExercise = function () {
        var formula1 = $(FORMULA1).val(),
            formula2 = $(FORMULA2).val(),
            equation,
            exerciseMethod,
            stepValidation = $(SWITCH_VALIDATION).bootstrapSwitch('status'); // true || false    
            
        //if (formula1 === formula2) {
        //    self.showErrorToolTip($('#equivsign'), Resources.getSpecificMessage(LogEXSession.getLanguage(), "identical"));
        //    return false;
        //}
        
        equation = new Equation();
        exerciseMethod = Resources.getExerciseMethod(this.exerciseType);
        equation.setFormula1(formula1);
        equation.setFormula2(formula2);
        self.exercise = new TwoWayExercise(equation.getText(), exerciseMethod, stepValidation);
        //this.exerciseSolver.solve(self.exercise, self.onNewExerciseValidated, self.onErrorCreatingExercise);
        this.exerciseCreator.create(this.exerciseType, stepValidation, self.exercise.equation.getText(), this.onExerciseGenerated, this.onErrorCreatingExercise);
    };

    /**
        Handles the error that an exercise can not be created               
     */
    this.onErrorCreatingExercise = function (errorMessage) {
        var syntaxError,
            column;
            
        switch(errorMessage)
        {
            case "Not suitable":
                self.showErrorToolTip($('#equivsign'), Resources.getSpecificMessage(LogEXSession.getLanguage(), errorMessage));
                break;
            case "Is ready":
                self.showErrorToolTip($('#equivsign'), Resources.getSpecificMessage(LogEXSession.getLanguage(), "identical"));
                break;
            default:
                syntaxError = errorMessage.split(":")[1].replace("\\n"," ").replace("\\8594","→").replace("\\8596","↔").replace("\\8743","∧").replace("\\8744","∨").replace("\\172","¬").replace("\\","").replace("nexpecting",", expecting");               
                column = errorMessage.split(":")[0].split(",")[1].replace(")","").replace("column","").trim() - 4;
                if (column <= $(FORMULA1).val().length)
                {
                    self.showErrorToolTip($(FORMULA1), syntaxError);
                } else {
                    self.showErrorToolTip($(FORMULA2), syntaxError);
                }
        }
    };

    /**
        Handles the event that an exercise is validated after the user has chosen to create a new exercise
     */
    /*this.onNewExerciseValidated = function (solution) {

        self.clearErrors();
        var lastStep = solution.getCurrentStep();
        if (lastStep.equation.formula1 !== lastStep.equation.formula2) {
            // de nieuwe oefening kan niet opgelost worden door de strategie
            self.showErrorToolTip($('#equivsign'), Resources.getSpecificMessage(LogEXSession.getLanguage(), "not-equivalent"));
            $('#equivsign').attr("src", "img/equivsignerr.png");

            return;
        }

        self.onExerciseGenerated(self.exercise);
    };*/

    /**
        Handles the event that an exercise is generated       
     */
    this.onExerciseGenerated = function (exercise) {
        self.exercise = exercise;
        self.clearErrors();

        $('#exercise-steps').show();
        if ($(NEW_EXERCISE_CONTENT)) {
            $(NEW_EXERCISE_CONTENT).remove();
        }

        $(EXERCISE_LEFT_FORMULA).text(exercise.equation.formula1);
        $(EXERCISE_RIGHT_FORMULA).text(exercise.equation.formula2);

        $(FORMULA1).val(exercise.equation.formula1);
        $(FORMULA1).kbinput('setPreviousValue', $(FORMULA1).val());
        $('#formula1original').val($(FORMULA1).val());
        $(FORMULA2).val(exercise.equation.formula2);
        $(FORMULA2).kbinput('setPreviousValue', $(FORMULA2).val());
        $('#formula2original').val($(FORMULA2).val());
        self.exercise = exercise;

        self.disableUI(false);
        $('#active-step-top').show();
        $('#active-step-bottom').show();
        $(EXERCISE).show();
        $('#exercise-steps').show();
		if(config.displayDerivationButton){
			$(BTN_SOLVEEXERCISE).show();
		}
        $('#validate-exercise').show();
        $(EXERCISE_RIGHT_FORMULA).show();
        $('#bottom').show();
        $('#equivsign').attr("src", "img/equivsign.png");

        //When using hotkeys focus on formula field must be reset        
        $(FORMULA1).blur();
        $('#formula2').blur();
        $(FORMULA1).focus();

        //Reset rules value at start
        $(RULE_LISTBOX_TOP).val('');
        $(RULE_LISTBOX_BOTTOM).val('');
        
        $(SWITCH_VALIDATION).bootstrapSwitch('setActive', true);  // true || false
        
        $('#active-step-bottom').hide();
        $('#active-step-top').hide();
        $('#add-step-bottom-button').show();
        $('#add-step-top-button').show();
        
    };

    /**
        Handles the error that an exercise can not generated               
     */
    this.onErrorGeneratingExercise = function () {
        self.disableUI(false);
        self.showErrorToolTip($('#new-exercise-dropdown'), Resources.getSpecificMessage(LogEXSession.getLanguage(), "error-generating-exercise"), "right");
    };
    
    this.showSolution = function () {
        window.open("twowaysolution.html?formula=" + this.exercise.equation.getText() + "&exerciseType=" + this.exercise.type, "_blank", "location=no,width=1020,height=600,status=no,toolbar=no");
    };

    // exercise solving
    //this.exerciseSolver = new TwoWayExerciseSolver();

    /**
        Solves the exercise
     */
    /*this.solveExercise = function () {
        this.disableUI(true);
        this.exerciseSolver.solve(this.exercise, this.onExerciseSolved, this.onErrorSolvingExercise);
    };
    */

    /**
        Handles the event that an exercise is solved
        @param {TwoWayStepCollection} solution - The solution
     */
    /*this.onExerciseSolved = function (solution) {
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
            self.insertStep(this, false);
        });
        if (lastStep) {
            self.insertLastStep(lastStep);
        }
        self.disableUI(false);
    };
*/
    /**
        Handles the error that an exercise can not be solved               
     */
 /*   this.onErrorSolvingExercise = function () {
        self.showErrorToolTip($(BTN_SOLVEEXERCISE), Resources.getSpecificMessage(LogEXSession.getLanguage(), "error-solving-exercise"), "right");
        self.disableUI(false);
    };
   */ 
    
// exercise solving
    this.exerciseSolver = new TwoWayExerciseSolver();
    
    /**
        Shows the next step
     */
    //this.showNextStep = function () {
    //    this.disableUI(true);
    //    this.exerciseSolver.solveNextStep(self.exercise, this.onNextStepSolved, this.onErrorSolvingNextStep);
    //};
    
    this.showNextStep = function () {
        this.dummyExercise = new TwoWayExercise(this.exercise.equation.getText(), this.exercise.type, false);
        this.dummyExercise.steps.push(new TwoWayStep(this.exercise.getCurrentStep().equation.getText(), ""));
        this.disableUI(true);
        
        if (!this.exercise.usesStepValidation && this.exercise.steps.steps.length > 1) {
            //this.exerciseValidator.validateStep(this.exercise.type, this.dummyExercise.getPreviousStep(), this.dummyExercise.getCurrentStep(), this.showNextStepWithoutStepValidation, this.onErrorSolvingNextStep);
			this.exerciseSolver.solveNextStep(this.exercise, this.onNextStepSolved, this.onErrorSolvingNextStep);
        } else {   
            this.exerciseSolver.solveNextStep(this.exercise, this.onNextStepSolved, this.onErrorSolvingNextStep);
            //this.exerciseSolver.solveNextStep(this.exercise, this.GetStepsRemaining, this.onErrorSolvingNextStep);
		}
    };
    
    this.showNextStepWithoutStepValidation = function () {
        if (self.dummyExercise.getCurrentStep().isValid || self.dummyExercise.getCurrentStep().isCorrect) {
            self.exerciseSolver.solveNextStep(self.exercise, self.onNextStepSolved, self.onErrorSolvingNextStep);
            //self.exerciseSolver.solveNextStep(self.exercise, self.this.GetStepsRemaining, self.onErrorSolvingNextStep);
        } else {
            self.disableUI(false);
            self.showErrorToolTip($(BTN_SHOW_NEXT_STEP), Resources.getSpecificMessage(LogEXSession.getLanguage(), "error-solving-next-stap-inv"));
        }
    };
	
	
    /**
        Handles the event that the next step of an exercise is solved      
        @param {TwoWayStep} nextStep - The next step
     */
    this.onNextStepSolved = function (nextStep) {
        self.exercise.steps.push(nextStep);

        nextStep.isValid = true;
        nextStep.isRuleValid = true;
		
		//Reset rule value after valid step
        $("#rule").val('');        
		self.getStepsRemaining(self.exercise.type,self.exercise.getCurrentStep());
        if (self.exercise.usesStepValidation) {
            //self.exerciseValidator.validateStep(self.exercise.type, self.exercise.getPreviousStep(), self.exercise.getCurrentStep(), self.onStepValidated, self.onErrorValidatingStep);
            //self.exerciseValidator.validateStep(self.exercise.type, self.exercise.getPreviousStep(), self.exercise.getCurrentStep(), self.getStepsRemaining, self.onErrorValidatingStep);
			
		} else {
			//self.onStepValidated();
            //self.getStepsRemaining(self.exercise.type,self.exercise.getCurrentStep());
        }
    };
  
	
    /**
        Handles the error that the next step can not be solved               
     */
    this.onErrorSolvingNextStep = function () {
        self.showErrorToolTip($(BTN_SHOW_NEXT_STEP), Resources.getSpecificMessage(LogEXSession.getLanguage(), "error-solving-next-step"));
    };

    /**
        Shows the hint  
     */
    this.showHint = function () {
        this.exerciseSolver.getHelpForNextStep(self.exercise, this.onHelpForNextStepFound, this.onErrorGettingHelpForNextStep);
    };

    /**
        Handles the event that help for a next step is found            
        @param {TwoWayStep} nextProofStep - The next proof step
     */
    this.onHelpForNextStepFound = function (nextProofStep) {
        $(FORMULA1).popover(DESTROY);
        $(FORMULA2).popover(DESTROY);

        var language = LogEXSession.getLanguage(),
            helpText = Resources.getText(language, "nohint"),
            formula = $(FORMULA1),
			step  = self.exercise.getCurrentStep(),
			state = [self.exercise.type, step.strategyStatus, step.equation.getText(), step.strategyLocation];
			

		// formula is nodig om te weten waar de popover getoond moet worden	
		if ($(FORMULA1).is(":visible")){
			formula = $(FORMULA1);
    } else {
			formula = $(FORMULA2);		
    }
			
		// het kan echter zijn dat formule die bewerkt moet worden in de volgende stap
		// juist de andere formule is (die niet zichtbaar is)
		// geef afhankelijk van de situatie een passende hint
		
		if  ($(FORMULA1).is(":visible") && nextProofStep.isBottomStep) {
        helpText = Resources.getSpecificMessage(language, "do-bottom-up-step");
		}
		else if ($(FORMULA2).is(":visible") && nextProofStep.isTopStep) {
			  helpText = Resources.getSpecificMessage(language, "do-top-down-step");
	  }
		else if (Rules[nextProofStep.rule] !== null) {
        helpText = "<div id=\"hint1\">" + Resources.getSpecificMessage(language, "rewritethis") + "<br/><a href=\"#\" id=\"toggle-hint1\">» " + Resources.getText(language, "nexthint") + "</a></div>";
    }

		// overbodig?
        //if (nextProofStep.isBottomStep) {
        //    formula = $(FORMULA2);
        // }

        formula.popover({
            trigger: 'manual',
            placement: 'top',
            title: 'Hint',
            content: helpText,
            html: true
        });
        formula.popover('show');

        $('#toggle-hint1').on('click', function () {
            formula.popover(DESTROY);
            helpText = "<div id=\"hint2\">" + Resources.getUseRuleMessage(language, nextProofStep.rule) + "<br/><a href=\"#\" id=\"toggle-hint2\">» " + Resources.getText(language, "nexthint") + "</a></div>";
            formula.popover({
                trigger: 'manual',
                placement: 'top',
                title: 'Hint',
                content: helpText,
                html: true
            });
            formula.popover('show');
			
			//Log hint
			IdeasServiceProxy.log(state, "Hint: useRule");

            $('#toggle-hint2').on('click', function () {
                formula.popover(DESTROY);

				var oldFormula = formula.val();
                var newFormula = nextProofStep.equation.formula1;

                if (nextProofStep.isBottomStep) {
                    newFormula = nextProofStep.equation.formula2;
                }

                helpText = "<div id=\"hint3\">" + Resources.getFullHintMessage(language, nextProofStep.rule, showdiff(true, newFormula,oldFormula)) + " <button type=\"button\" id=\"auto-step\" class=\"btn btn-success pull-right\">" + Resources.getText(language, "dostep") + "</button></div>";
                formula.popover({
                    trigger: 'manual',
                    placement: 'top',
                    title: 'Hint',
                    content: helpText,
                    html: true
                });
                formula.popover('show');

                $('#auto-step').on('click', function () {
                    $(FORMULA1).popover(DESTROY);
                    $(FORMULA2).popover(DESTROY);
                    self.disableUI(true);
                    self.showNextStep();
                });
				
				//Log hint
				IdeasServiceProxy.log(state, "Hint: rewriteThisUsing");
            });
        });
    };

    /**
        Handles the error that the next step can not be solved               
     */
    this.onErrorGettingHelpForNextStep = function () {
        self.showErrorToolTip($(BTN_SHOWHINT), Resources.getSpecificMessage(LogEXSession.getLanguage(), "error-showing-hint"));
    };

    // validation
    this.exerciseValidator = new TwoWayExerciseValidator();
    this.syntaxValidator = new SyntaxValidator();

    /**
        Validates a step
           
     */
    this.validateStep = function (isTopStep) {
        var ruleListBox;
        if (isTopStep) {
            ruleListBox = RULE_LISTBOX_TOP;
        } else {
            ruleListBox = RULE_LISTBOX_BOTTOM;
        }

        if ($(ruleListBox).val() === '' && self.exercise.usesStepValidation) {
            //self.showErrorToolTip($(RULE_LISTBOX), Resources.getSpecificMessage(LogEXSession.getLanguage(), "no-rule"));
            self.showErrorToolTip($(ruleListBox), Resources.getSpecificMessage(LogEXSession.getLanguage(), "no-rule"));
            return false;
        }

        var changed = $("#formula1original").val() !== $(FORMULA1).val() || $("#formula2original").val() !== $(FORMULA2).val();

        if (!changed) {
            self.showErrorToolTip($('#equivsign'), Resources.getSpecificMessage(LogEXSession.getLanguage(), "not-changed"));
            return false;
        }

        //self.validateFormulas(self.onFormulasValidatedBeforeValidatingStep);
        self.disableUI(true);
        self.onFormulasValidatedBeforeValidatingStep(isTopStep);
    };

    /**
        Handles the event that the formulas are syntax validated before validating the step
           
     */
    this.onFormulasValidatedBeforeValidatingStep = function (isTopStep) {
        var ruleListBox;
        if (isTopStep) {
            ruleListBox = RULE_LISTBOX_TOP;
        } else {
            ruleListBox = RULE_LISTBOX_BOTTOM;
        }
        
        if (!self.isFormula1Valid || !self.isFormula2Valid) {
            // foutmeldingen worden al getoond in validateFormulas
            return false;
        }

        self.clearErrors();
        //self.exercise.steps.push(new TwoWayStep($(FORMULA1).val() + "==" + $(FORMULA2).val(), $(RULE_LISTBOX).val()));
        self.exercise.steps.push(new TwoWayStep($(FORMULA1).val() + "==" + $(FORMULA2).val(), $(ruleListBox).val()));

        if (self.exercise.usesStepValidation) {
            //self.exerciseValidator.validateStep(self.exercise.type, self.exercise.getPreviousStep(), self.exercise.getCurrentStep(), self.onStepValidated, self.onErrorValidatingStep);
            self.exerciseValidator.validateStep(self.exercise.type, self.exercise.getPreviousStep(), self.exercise.getCurrentStep(), self.getStepsRemaining, self.onErrorValidatingStep);

		} else {
			//self.onStepValidated();
            self.getStepsRemaining(self.exercise.type,self.exercise.getCurrentStep());
        }
    };

    /**
        Validates an exercise
     */
    this.validateExercise = function () {
		var step = self.exercise.getCurrentStep(); 
		var state = [self.exercise.type, step.strategyStatus, step.equation.getText(), step.strategyLocation];	
        this.disableUI(true);
        if (this.exercise.usesStepValidation) {
            if (this.exercise.isReady) {
			
                $('#active-step-top').hide();
                $('#active-step-bottom').hide();
                $('#bottom').hide();
                $(FORMULA1).blur();
                $(FORMULA2).blur();

                $('.close').each(function () {
                    $(this).hide();
                });

                var stepTemplate = $('#exercise-last-step-template'),
                    exerciseStepHtml = stepTemplate.render({
                        "leftformula":    $(FORMULA1).val(),
                        "rightformula":   $(FORMULA2).val() //,
						//"stepsremaining": 123
                    });

                $('#active-step-top').before(exerciseStepHtml);
                self.disableUI(false);
				// Log the check ready event
				IdeasServiceProxy.log(state, "Ready: true (call)");
				
            } else {
                this.clearErrors();
                $(FORMULA1).addClass('error');
                $(FORMULA2).addClass('error');
                self.disableUI(false);
                            
                self.showErrorToolTip($('#equivsign'), Resources.getSpecificMessage(LogEXSession.getLanguage(), "incomplete"));
				
				// Log the check ready event
				IdeasServiceProxy.log(state, "Ready: false (call)");
            }
        } else {
            self.exerciseValidator.validateExercise(self.exercise, 0, 0, self.onExerciseValidated, self.onErrorExerciseValidate);
        }
    }; 
    
    this.onExerciseValidated = function () {
        var i = 0,
            isReady = false,
            completelyCorrect = true;
            
        self.reset();
        
        self.onExerciseGenerated(self.exercise);	

        $.each(self.exercise.steps.steps, function () {
            if (this.isTopStep || this.isBottomStep) {
                var rule = "",
                    stepTemplate,
                    exerciseStepHtml,
                    error = "";
                    
                if (this.isTopStep) {
                    stepTemplate = $('#exercise-top-step-template');
                } else {
                    stepTemplate = $('#exercise-bottom-step-template');
                }
                
                if (this.rule !== undefined && this.rule !== "") {					
                    rule = Resources.getRule(LogEXSession.getLanguage(), this.rule);
                }
                
                if (i > 0 && !this.isValid && completelyCorrect === true) {
                    completelyCorrect = false;
                }
                
                if (!this.isSyntaxValid && self.exercise.usesStepValidation) {
                    error = Resources.getInvalidFormulaMessage();
                } else if (!this.isRuleValid && self.exercise.usesStepValidation) {
                    error = Resources.getSpecificMessage(LogEXSession.getLanguage(), "wrongrule");
                } else if (this.isCorrect && self.exercise.usesStepValidation) {
                    error = Resources.getSpecificMessage(LogEXSession.getLanguage(), "correctnotval");
                } else if (this.isSimilar && self.exercise.usesStepValidation) {
                    error = Resources.getSpecificMessage(LogEXSession.getLanguage(), "similar");
                } else if (this.isBuggy && self.exercise.usesStepValidation) {
                    error = Resources.getMessageForBuggyRule(LogEXSession.getLanguage(), this.buggyRule);
                }

                exerciseStepHtml = stepTemplate.render({
                    "rule": rule,
                    "leftformula": this.equation.formula1,
                    "rightformula": this.equation.formula2,
                    "canDelete": true,
                    "isWrong": !this.isValid || this.isCorrect,
                    "hasRule": this.rule !== undefined,
                    "step": i,
                    "ruleCombobox": self.renderRuleCombobox(this.rule),
                    "stepValidation": false,
                    "error": error,
					"stepsremaining": "" 
                });
                
                if (this.isTopStep) {
                    $('#active-step-top').before(exerciseStepHtml);
                } else {
                    $('#active-step-bottom').after(exerciseStepHtml);
                }
                
                if (this.isReady && !isReady && completelyCorrect === true) {
                    isReady = true;
                    self.insertLastStep(this);
                }
                
                if (!this.isRuleValid && i > 0) {
                    self.initializeRules($('#rule' & i));
                }
            }   
            i++;
        });

        $('#formula1').val(self.exercise.getCurrentStep().equation.formula1);
        $('#formula1').kbinput('setPreviousValue', $('#formula1').val());
        $('#formula1original').val($('#formula1').val());
        
        $('#formula2').val(self.exercise.getCurrentStep().equation.formula2);
        $('#formula2').kbinput('setPreviousValue', $('#formula2').val());
        $('#formula2original').val($('#formula2').val());
        
        self.colorRows();
        $('#formula1').blur();
        $('#formula2').blur();
        $('.retryFormula').kbinput('hide');
        
        self.disableUI(false);
        
        if (!isReady) {
            self.showErrorToolTip($('#validate-exercise'), Resources.getSpecificMessage(LogEXSession.getLanguage(), "incomplete"));
        }
    };
    
    this.onErrorExerciseValidate = function () {
        //TODO: MAIL VAN RENE OVERNEMEN self.showErrorToolTip($('#formula'), Recourses.getText(LogEXSession.getLanguage(),'error-validating-step')); 
    };

	// here we set the number of steps that remain for step2 
	this.getStepsRemaining = function (exerciseType, step2) {
		var that = step2;
		
		// [BHR] disable the service call to stepsremaining. Instead, we use the
		// empty string. It would be better to remove the 'stepsremaining' field
		// in the user interface.
		that.stepsRemaining=""; 
		
		// when useStepValidiation is false (in the config), there is no prior check
		// to see if the step is correct. Hence, disable the automatic 'proof is 
		// 'finished' feature when clicking 'Send' button. 
		if (self.exercise.usesStepValidation) {
		   self.setReady();
	  }
		self.onStepValidated();
		
		/*

		var onError = function (jqXHR, textStatus, errorThrown) {
			// something went wrong, we have no idea howmany are left
			that.stepsRemaining="?";
			self.onStepValidated();
			},
		onSuccess = function (data) {
			// set the number of steps left in the Exercise Step
			that.stepsRemaining = data.result;
			self.onStepValidated();
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
	};
	
	/**
        Checks if the exercise is ready 		      
     */
	this.setReady = function(){	
		var step = self.exercise.getCurrentStep(); 
		var state = [self.exercise.type, step.strategyStatus, step.equation.getText(), step.strategyLocation];		
		if(!step.isReady){
			step.isReady = step.equation.getEquationIsSolved();
		}
		//Log the ready event
		if(step.isReady){
			IdeasServiceProxy.log(state, "Ready: true (no call)");
		}		
	};
	
    /**
        Handles the event that a step is validated
           
     */
    this.onStepValidated = function () {
        self.clearErrors();
        var currentStep = self.exercise.getCurrentStep();
        var ruleListBox;
        
        if (currentStep.isTopStep) {
            ruleListBox = RULE_LISTBOX_TOP;
        } else {
            ruleListBox = RULE_LISTBOX_BOTTOM;
        }
        
        $(SWITCH_VALIDATION).bootstrapSwitch('setActive', false);  // true || false

        if (!currentStep.isValid && self.exercise.usesStepValidation) {
            var message = Resources.getSpecificMessage(LogEXSession.getLanguage(), "wrongstep");
            self.exercise.steps.pop();
            
            if (!currentStep.isSyntaxValid && self.exercise.usesStepValidation) {
                message = Resources.getInvalidFormulaMessage();
                if (currentStep.isTopStep) {
                    self.showErrorToolTip($(FORMULA1), Resources.getInvalidFormulaMessage(LogEXSession.getLanguage()));
                } else {
                    self.showErrorToolTip($(FORMULA2), Resources.getInvalidFormulaMessage(LogEXSession.getLanguage()));
                }
                self.disableUI(false);
                return;
            }

            if (!currentStep.isRuleValid && self.exercise.usesStepValidation) {
                self.showErrorToolTip($(ruleListBox), Resources.getSpecificMessage(LogEXSession.getLanguage(), "wrongrule"));
                self.disableUI(false);
                return;
            }

            //if (self.exercise.isCorrect) {
            if (currentStep.isCorrect && self.exercise.usesStepValidation) {
                if (currentStep.isTopStep) {
                    self.showErrorToolTip($(FORMULA1), Resources.getSpecificMessage(LogEXSession.getLanguage(), "correctnotval"));
                } else {
                    self.showErrorToolTip($(FORMULA2), Resources.getSpecificMessage(LogEXSession.getLanguage(), "correctnotval"));
                }
                self.disableUI(false);
                return;
            }

            //if (self.exercise.isSimilar) {
            if (currentStep.isSimilar && self.exercise.usesStepValidation) {
                self.showErrorToolTip($('#equivsign'), Resources.getSpecificMessage(LogEXSession.getLanguage(), "similar"));
                self.disableUI(false);
                return;
            }

            //if (self.exercise.isBuggy) {
            if (currentStep.isBuggy && self.exercise.usesStepValidation) {
                message = Resources.getMessageForBuggyRule(LogEXSession.getLanguage(), currentStep.buggyRule);
            }

            if (currentStep.isTopStep) {
                self.showErrorToolTip($(FORMULA1), message);
            } else {
                self.showErrorToolTip($(FORMULA2), message);
            }

            $('#equivsign').attr("src", "img/equivsignerr.png");
            
            //    Reset rule value after valid step
            $(RULE_LISTBOX_TOP).val('');
            $(RULE_LISTBOX_BOTTOM).val('');
            
            self.disableUI(false);
            return;
        }

        self.clearErrors();

        // bij auto step is formula1 nog niet goed gevuld
        //$(FORMULA1).val(self.exercise.getCurrentStep().equation.formula1);
        $(FORMULA1).val(currentStep.equation.formula1);
        $(FORMULA1).kbinput('setPreviousValue', $(FORMULA1).val());
        $('#formula1original').val($(FORMULA1).val());

        // bij auto step is formula2 nog niet goed gevuld
        $(FORMULA2).val(currentStep.equation.formula2);
        $(FORMULA2).kbinput('setPreviousValue', $(FORMULA2).val());
        $('#formula2original').val($(FORMULA2).val());

        self.insertStep(currentStep, true);
        if (currentStep.isReady) {
            self.insertLastStep(currentStep);
        }

		self.disableUI(false);
		
        //Bij het gebruik van hotkeys moet de focus van het formula veld worden reset        
        if ($(FORMULA1).is(':focus')) {
            $(FORMULA1).blur();
            $(FORMULA1).focus();
        } else if ($(FORMULA2).is(':focus')) {
            $(FORMULA2).blur();
            $(FORMULA2).focus();
        }

        //    Reset rule value after valid step
        $(RULE_LISTBOX_TOP).val('');
        $(RULE_LISTBOX_BOTTOM).val('');
    };

    /**
        Handles the error that the step can not be validated               
     */
    this.onErrorValidatingStep = function (isTopStep) {
        var validateButton;
        if (isTopStep) {
            validateButton = '#validate-step-top';
        } else {
            validateButton = '#validate-step-bottom';
        }
        
        self.disableUI(false);
        //self.showErrorToolTip($(BTN_VALIDATESTEP), Resources.getSpecificMessage(LogEXSession.getLanguage(), "error-validating-step"));
        self.showErrorToolTip($(validateButton), Resources.getSpecificMessage(LogEXSession.getLanguage(), "error-validating-step"));
    };

    
    //rvl: niet meer nodig, wordt niet meer gebruikt
    /**
        Validates the formulas
                
        @param onFormulasValidated - The callback function
     */
    //this.validateFormulas = function (onFormulasValidated) {
    //    this.clearErrors();
    //    
    //    //this.validateFormula($(FORMULA1).val(), function (isValid, formulaText) {
    //    //    self.onFormula1Validated(isValid, formulaText, onFormulasValidated);
    //    //});
    //};
    

    /**
        Handles the event that formula 1 is validated
           
            
        @param {Boolean} isValid - True if valid, false otherwise
        @param {String} formulaText - The text of the formula
        @param onFormulasValidated - The callback function
     */
    this.onFormula1Validated = function (isValid, formulaText, onFormulasValidated) {
        self.onFormulaValidated(isValid, formulaText);
        self.validateFormula($(FORMULA2).val(), function (isValid, formulaText) {
            self.onFormula2Validated(isValid, formulaText, onFormulasValidated);
        });
    };

    /**
        Handles the event that formula 2 is validated
           
            
        @param {Boolean} isValid - True if valid, false otherwise
        @param {String} formulaText - The text of the formula
        @param onFormulasValidated - The callback function
     */
    this.onFormula2Validated = function (isValid, formulaText, onFormulasValidated) {
        self.onFormulaValidated(isValid, formulaText);
        onFormulasValidated();
    };

    /**
        Validates the formula
          
        @param formula - The DOM element that contains the formula
        @param onFormulasValidated - The callback function
     */
    this.validateFormula = function (formula, callback) {
        if (typeof callback === "undefined") {
            callback = this.onFormulaValidated;
        }

        this.syntaxValidator.validateSyntax(formula, callback);
    };

    /**
        Handles the event that a formula is validated
           
                
        @param {Boolean} isValid - True if the formula is valid, false otherwise
        @param {String} formulaText - The text of the formula
     */
    this.onFormulaValidated = function (isValid, formulaText) {
        if (!isValid) {
            var formula = $(FORMULA1);
            if ($(FORMULA1).val() !== formulaText) {
                formula = $(FORMULA2);
            }

            self.showErrorToolTip(formula, Resources.getSpecificMessage(LogEXSession.getLanguage(), "invalidformula"), 'bottom');
        }

        if ($(FORMULA1).val() === formulaText) {
            self.isFormula1Valid = isValid;
        } else {
            self.isFormula2Valid = isValid;
        }
    };

    /**
        Inserts a proof step
          
        @param {TwoWayStep} step - The proof step
        @param {Boolean} canDelete - True if the proof step can be deleted, false otherwise
     */
    this.insertStep = function (step, canDelete) {

        // dit is de start opgave
        if (!step.isTopStep && !step.isBottomStep) {
            return;
        }

        var rule = Resources.getRule(LogEXSession.getLanguage(), step.rule),
            stepTemplate,
            exerciseStepHtml,
			error;
			
		// todo
		// error boodschap bepalen aan de hand van step
		

        if (step.isTopStep) {
            stepTemplate = $('#exercise-top-step-template');
        } else {
            stepTemplate = $('#exercise-bottom-step-template');
        }
        
        exerciseStepHtml = stepTemplate.render({
			"error" : error,
            "rule": rule,
            "leftformula": step.equation.formula1,
            "rightformula": step.equation.formula2,
            "canDelete": canDelete,
            "isWrong": false,
            "hasRule": this.rule !== undefined,
            "step": 1,
            "stepValidation": true,
			"stepsremaining": step.stepsRemaining
        });

        if (step.isTopStep) {
            $('#active-step-top').before(exerciseStepHtml);
        } else {
            $('#active-step-bottom').after(exerciseStepHtml);
        }

        this.colorRows();

    };

    /**
        Inserts the last proof step
          
        @param {TwoWayStep} step - The proof step
     */
    this.insertLastStep = function (step) {

        var stepTemplate = $('#exercise-last-step-template'),
            exerciseStepHtml = stepTemplate.render({
                "leftformula": step.equation.formula1,
                "rightformula": step.equation.formula2
            });

        $('#active-step-top').before(exerciseStepHtml);
        $('#active-step-top').hide();
        $('#active-step-bottom').hide();
        $('#bottom').hide();
        $(FORMULA1).blur();
        $(FORMULA2).blur();
        
        this.clearErrors();
        
        $('.remove-top-step').hide();
        $('.remove-bottom-step').hide();
        
        $('#active-step-top').hide();
        $('#active-step-bottom').hide();
        $('#add-step-top-button').hide();
        $('#add-step-bottom-button').hide();
        
        $(SWITCH_VALIDATION).bootstrapSwitch('setActive', true);  // true || false
    };

    /**
        Removes the top steps, starting at the specified source index
          
        @param source - The source DOM element
     */
    this.removeTopStep = function (source) {
        this.clearErrors();		
        var parent = source.parents('div.exercise-step-added-top'),
            allExerciseSteps = $(EXERCISE_TOP_STEPS),
            index = allExerciseSteps.index(parent),
			step  = this.exercise.getCurrentStep(),
			state = [this.exercise.type, step.strategyStatus, step.equation.getText(), step.strategyLocation]; 

        this.exercise.steps.removeTopSteps(index);

        allExerciseSteps.slice(index).remove();

        $(FORMULA1).val(this.exercise.getCurrentStep().equation.formula1);
        $(FORMULA1).kbinput('setPreviousValue', $(FORMULA1).val());
        $('#formula1original').val($(FORMULA1).val());
        $(FORMULA2).val(this.exercise.getCurrentStep().equation.formula2);
        $(FORMULA2).kbinput('setPreviousValue', $(FORMULA2).val());
        $('#formula2original').val($(FORMULA2).val());
        this.colorRows();

        //Bij het gebruik van hotkeys moet de focus van het formula veld worden reset        
        if ($(FORMULA1).is(':focus')) {
            $(FORMULA1).blur();
            $(FORMULA1).focus();
        } else if ($(FORMULA2).is(':focus')) {
            $(FORMULA2).blur();
            $(FORMULA2).focus();
        }
		//Log the use of undo 
		IdeasServiceProxy.log(state,'undo');
    };
    
    this.retryFormula = function(source) {
        var index = source.attr("data-step"),
            editStep = this.exercise.steps.steps[index];
            
        if (editStep.isTopStep) {
            editStep.equation.formula1 = source.val();
        } else {
            editStep.equation.formula2 = source.val();
        }
    };
    
    this.retryRule = function(source) {
        var index = source.attr("data-step"),
            editStep = this.exercise.steps.steps[index];
            
        editStep.rule = source.val();
    };    

    /**
        Removes the bottom steps, starting at the specified source index
          
        @param source - The source DOM element
     */
    this.removeBottomStep = function (source) {
        this.clearErrors();
        var parent = source.parents('div.exercise-step-added-bottom'),
            allExerciseSteps = $(EXERCISE_BOTTOM_STEPS),
            index = (allExerciseSteps.length - allExerciseSteps.index(parent) - 1),
			step  = this.exercise.getCurrentStep(),
			state = [this.exercise.type, step.strategyStatus, step.equation.getText(), step.strategyLocation];
        this.exercise.steps.removeBottomSteps(index);

        allExerciseSteps.slice(0, allExerciseSteps.index(parent) + 1).remove();

        $(FORMULA1).val(this.exercise.getCurrentStep().equation.formula1);
        $(FORMULA1).kbinput('setPreviousValue', $(FORMULA1).val());
        $('#formula1original').val($(FORMULA1).val());
        $(FORMULA2).val(this.exercise.getCurrentStep().equation.formula2);
        $(FORMULA2).kbinput('setPreviousValue', $(FORMULA2).val());
        $('#formula2original').val($(FORMULA2).val());
        this.colorRows();

        //Bij het gebruik van hotkeys moet de focus van het formula veld worden reset        
        if ($(FORMULA1).is(':focus')) {
            $(FORMULA1).blur();
            $(FORMULA1).focus();
        } else if ($(FORMULA2).is(':focus')) {
            $(FORMULA2).blur();
            $(FORMULA2).focus();
        }
		//Log the use of undo
		IdeasServiceProxy.log(state,'undo');
    };

    // user interface bindings
    $("#lang-NL").click(function () {
        LogEXSession.setLanguage("NL");
        self.initializeLabels();
        self.initializeRules();
        $("#button-NL").addClass('active');
        $("#button-EN").removeClass('active');
    });

    $("#lang-EN").click(function () {
        LogEXSession.setLanguage("EN");
        self.initializeLabels();
        self.initializeRules();
        $("#button-EN").addClass('active');
        $("#button-NL").removeClass('active');
    });
	
	/**
      Use the example exercises
    */
    this.bindExampleExercises = function(){	
		for (var i= 0; i < self.exampleExercises.length; i++){
			var	nr = self.exampleExercises[i];
			var id = '#exercise' + (nr + 1);	
			
			(function (_nr, _id) {				
				$(_id).click( function(){
					self.useExercise(_nr);
				});
			})(nr, id);			
		} 
	};

    $("#generate-exercise").click(function () {
        if (config.randomExercises) {
           self.generateExercise();
        }
    });

    $(BTN_SOLVEEXERCISE).click(function () {
        //$(FORMULA1).popover(DESTROY);
        //$(FORMULA2).popover(DESTROY);
        //$('.retryFormula').popover(DESTROY);
        //$(FORMULA1).formulaPopover('hide');
        //$(FORMULA2).formulaPopover('hide');
        //$('.retryFormula').formulaPopover('hide');
        //self.solveExercise();
        self.showSolution();
        
    });

    $("#validate-step-top").click(function () {
        $(FORMULA1).popover(DESTROY);
        $(FORMULA2).popover(DESTROY);
        $('.retryFormula').popover(DESTROY);
        self.validateStep(true);
    });
    
    $("#validate-step-bottom").click(function () {
        $(FORMULA1).popover(DESTROY);
        $(FORMULA2).popover(DESTROY);
        $('.retryFormula').popover(DESTROY);
        self.validateStep(false);
    });

    $("#validate-exercise").click(function () {
        $(FORMULA1).popover(DESTROY);
        $(FORMULA2).popover(DESTROY);
        $('.retryFormula').popover(DESTROY);
        self.validateExercise();
    });

    $(BTN_SHOW_NEXT_STEP).click(function () {
        self.disableUI(true);
        $(FORMULA1).popover(DESTROY);
        $(FORMULA2).popover(DESTROY);
        $('.retryFormula').popover(DESTROY);
        self.showNextStep();
    });

    $('body').on('click', 'button.remove-top-step', function () {
        $(FORMULA1).popover(DESTROY);
        $(FORMULA2).popover(DESTROY);
        $('.retryFormula').popover(DESTROY);
        self.removeTopStep($(this));
    });

    $('body').on('click', 'button.remove-bottom-step', function () {
        $(FORMULA1).popover(DESTROY);
        $(FORMULA2).popover(DESTROY);
        $('.retryFormula').popover(DESTROY);
        self.removeBottomStep($(this));
    });
    
    $('body').on('focusout', '.retryFormula', function () {
        self.retryFormula($(this));
    });
        
    $('body').on('focusout', '.retryRule', function () {
        self.retryRule($(this));
    });

    $(RULE_LISTBOX_TOP).change(function () {
        self.clearErrors();
    });
    
    $(RULE_LISTBOX_BOTTOM).change(function () {
        self.clearErrors();
    });
    
    $('body').on('focus', FORMULA1, function () {
        $(FORMULA1).popover(DESTROY);
        $(FORMULA2).popover(DESTROY);
        $('.retryFormula').popover(DESTROY);
    });
    $('body').on('focus', FORMULA2, function () {
        $(FORMULA1).popover(DESTROY);
        $(FORMULA2).popover(DESTROY);
        $('.retryFormula').popover(DESTROY);
    });

    $(FORMULA1).bind('paste cut', function () {
        setTimeout(function () {
            $(FORMULA1).kbinput('tidy');
            $(FORMULA2).kbinput('undo');
            $('#equivsign').attr("src", "img/equivsign.png");
            $(FORMULA1).removeClass('error');
            $(FORMULA1).tooltip(DESTROY);
        }, 100);
    });
    
    $('body').on('focus','.retryFormula', function() {
        $(FORMULA1).popover(DESTROY);
        $(FORMULA2).popover(DESTROY);
        $('.retryFormula').popover(DESTROY);
        $('.retryFormula').popover('hide');
    });

    $(FORMULA2).bind('paste cut', function () {
        setTimeout(function () {
            $(FORMULA2).kbinput('tidy');
            $(FORMULA1).kbinput('undo');
            $('#equivsign').attr("src", "img/equivsign.png");
            $(FORMULA2).removeClass('error');
            $(FORMULA2).tooltip(DESTROY);
        }, 100);
    });


    $(BTN_SHOWHINT).click(function () {
        $(FORMULA1).popover(DESTROY);
        $(FORMULA2).popover(DESTROY);
        self.showHint();
    });
    
    this.changeStepValidation = function (stepValidation) {
		if(this.exercise){
			self.exercise.usesStepValidation = stepValidation;
		}
    };

    $(SWITCH_VALIDATION).on('switch-change', function(e, data) {
        self.changeStepValidation(data.value);
    });

    // key bindings
    $(document).bind('keydown', function (e) {
        self.keyBindings.onKeyDown(e);
    });
    
    $('#add-step-top-button').click(function() {
        $('#active-step-top').show();
        $('#active-step-bottom').hide();
        $('#add-step-top-button').hide();
		// toon de hint/next-step button
		if(config.displayHintButton){
			$(BTN_SHOWHINT).show();			
		}
		if(config.displayNextStepButton){
			$(BTN_SHOW_NEXT_STEP).show();
		}
        $('#add-step-bottom-button').show();

		// 20140430
		$(FORMULA2).val($('#formula2original').val());
		
		// verberg de hint popover als we van richting wisselen
		//formula.popover(DESTROY);
        $(FORMULA1).popover(DESTROY);
        $(FORMULA2).popover(DESTROY);	
	});
    
    $('#add-step-bottom-button').click(function() {
        $('#active-step-bottom').show();
        $('#active-step-top').hide();
        $('#add-step-bottom-button').hide();
		// toon de hint/next-step button
		if(config.displayHintButton){
			$(BTN_SHOWHINT).show();			
		}
		if(config.displayNextStepButton){
			$(BTN_SHOW_NEXT_STEP).show();
		}
		// verberg de hint popover als we van richting wisselen
		//formula.popover(DESTROY);
        $(FORMULA1).popover(DESTROY);
        $(FORMULA2).popover(DESTROY);

        $('#add-step-top-button').show();
		//20140430
		$(FORMULA1).val($('#formula1original').val());
		
		//$(FORMULA2).val(this.exercise.getCurrentStep().equation.formula2);
    });
    
}
