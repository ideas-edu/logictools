/*global document, LoginController, jQuery, LogEXSession, window, $, Resources */
(function ($) {
    "use strict";
    // we can now rely on $ within the safety of our "bodyguard" function
    $(document).ready(function () {
        //var loginController = new LoginController();
        //loginController.initializeLanguage();
        //loginController.initializeLabels();

		//if (LogEXSession.getStudentId() === null && LogEXSession.getStudentId()>0) {
		//window.location = "login.html";
		//	$('#login').modal('show');
		//	$('#login-student-id').focus();
		//	}
    });
}(jQuery));

/**
    LoginController is responsible for handling the user interaction and manipulation of the user interface with respect to the login process.
    @constructor
 */
function LoginController() {
    "use strict";

    var self = this;
    this.isStudentIdPopoverSelected = false;

    /**
        Initializes the language to the user settings or falls back to the browser language.
        
     */
    this.initializeLanguage = function () {
        var language,
            browserLanguage,
            buttonId;
        if (LogEXSession.getLanguage() === null) {
            // Default language = EN overrule with browser language
            language = "EN";
            browserLanguage = window.navigator.userLanguage || window.navigator.language;
            if (browserLanguage.substring(0, 2) === "nl") {
                language = "NL";
            }
            LogEXSession.setLanguage(language);
        }
        buttonId = "#button-" + LogEXSession.getLanguage();
        $(buttonId).addClass('active');
    };

    /**
        Initializes all buttons and label to correct language
        
     */
    this.initializeLabels = function () {
        var language = LogEXSession.getLanguage();

        //$('#login-footer').html(Resources.getText(language, "login-footer"));

        //$('#help').html("<i class='icon-question-sign'></i> " + Resources.getText(language, "help"));
        //$('#help').attr("href", "LogEX_manual_" + language + ".pdf").attr("target", "_new");
    };

    /**
        Shows an error message.
                
        @param element - The DOM element
        @param {string} toolTipText - The error message
        @param {string} placement - The placement of the error message (top | bottom | left | right)
     */
    this.showErrorToolTip = function (element, toolTipText, placement) {
        if (placement === "undefined") {
            placement = 'top';
        }
		//placement = 'bottom';
        element.addClass('error');
        element.tooltip({
            title: toolTipText,
            placement: placement,
			//z-index:30000,
            template: '<div class="tooltip error"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>'
        });
		
        element.tooltip('show');
    };

    /**
        Validates the student id.
        
        @returns {Boolean} true if valid, false otherwise
     */
    this.validate = function () {
        var id = $('#login-student-id').val();
        if (isNaN(id) || parseInt(id, 10) != id || id <= 0) {
            self.showErrorToolTip($('#login-student-id'), Resources.getSpecificMessage(LogEXSession.getLanguage(), "invalid-student-number"), "bottom");
            return false;
        }
        return true;
    };

    /**
        Logs the student in.
                
        @returns {Boolean} true if successful, false otherwise
     */
    this.login = function () {
        if (!self.validate()) {
            return false;
        }
        LogEXSession.setStudentId($('#login-student-id').val());
        LogEXSession.setDifficulty("medium");

        return true;
    };

    // start of user interface bindings
	// doh: deze elementen zijn nu dubbel -> stonden ook al in mainFrameController
    //$("#lang-NL").click(function () {
    //    LogEXSession.setLanguage("NL");
    //    self.initializeLabels();

    //    $("#button-NL").addClass('active');
    //    $("#button-EN").removeClass('active');
    //});

    //$("#lang-EN").click(function () {
    //    LogEXSession.setLanguage("EN");
    //    self.initializeLabels();

    //   $("#button-EN").addClass('active');
    //    $("#button-NL").removeClass('active');
    //});
	
    $('#login-form').submit(function(e) {
        e.preventDefault();
        if (self.login()) {
            $('#login').modal('hide');
        } else {
            $("#login-student-id").kbinput('show');        
        }
    });

    $("#login-student-id").kbinput('numeric');
}
