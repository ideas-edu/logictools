/*global MainFrameController,LogEXSession,jQuery,$,Resources,window,document, LoginController */

(function ($) {
    "use strict";
    // we can now rely on $ within the safety of our "bodyguard" function
    $(document).ready(function () {
        var mainFrameController = new MainFrameController(),
            paneID,
            src,
            loginController = new LoginController();

        mainFrameController.initializeLanguage();
        mainFrameController.initializeLabels();

        $("#login-student-id").popover('destroy');
        $('#login-student-id').blur();
        
        if (!(LogEXSession.getStudentId() > 0)) {
            $('#login').modal('show');    
            $('#login-student-id').focus();
            $('#login-student-id').kbinput('hide');
        }

        //Make sure tabs are only loaded when they are clicked for the first time.
        $('#myTabs').bind('show', function (e) {
            paneID = $(e.target).attr('href');
            src = $(paneID).attr('data-src');

            // if the iframe hasnt already been loaded: load it once
            if ($(paneID + " iframe").attr("src") === "") {
                $(paneID + " iframe").attr("src", src);
            }
        });
    });
}(jQuery));

function MainFrameController() {
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

        $("#button-" + language).addClass('active');

        $('#exercisetype').html(Resources.getText(language, "extype"));
        $('#exercise-logeq').html(Resources.getText(language, "exlogeq"));
        $('#exercise-dnv').html(Resources.getText(language, "exdnv"));
        $('#exercise-cnv').html(Resources.getText(language, "excnv"));
        $('#help').html("<i class='icon-question-sign'></i> " + Resources.getText(language, "help"));
        $('#help').attr("href", "LogEX_manual_" + language + ".pdf").attr("target", "_new");
        $(BTN_LOGOUT).html("<i class='icon-signout'></i> " + Resources.getText(language, "logout"));
        $('#welcome').html(Resources.getText(language, "welcome"));
        $('#loginhelptext1').html(Resources.getText(language, "loginhelptext1"));
        $('#loginhelptext2').html(Resources.getText(language, "loginhelptext2"));
        $('#loginhelptext3').html(Resources.getText(language, "loginhelptext3"));
        $('#loginhelptext4').html(Resources.getText(language, "loginhelptext4"));

        $('#login-submit').html("<i id='login-submit'></i> " + Resources.getText(language, "login-submit"));
        $('#login-welcome').html(Resources.getText(language, "welcome"));
        $('#login-header').html(Resources.getText(language, "login-header"));
        $('#login-student-id-label').html(Resources.getText(language, "login-student-id-label"));
    };

    $("#lang-NL").click(function () {
        LogEXSession.setLanguage("NL");
        self.initializeLabels();

        //All iFrames must be updated to Dutch
        if ($("#fraLogEQ").attr("src") !== "") {
            $("#fraLogEQ")[0].contentWindow.UITranslator.translate('LOGEQ');
        }
        if ($("#fraDNV").attr("src") !== "") {
            $("#fraDNV")[0].contentWindow.UITranslator.translate('DNV');
        }
        if ($("#fraCNV").attr("src") !== "") {
            $("#fraCNV")[0].contentWindow.UITranslator.translate('CNV');
        }

        //Switch view of the buttons (Bold = Active)
        $("#button-NL").addClass('active');
        $("#button-EN").removeClass('active');
    });

    $("#lang-EN").click(function () {
        LogEXSession.setLanguage("EN");
        self.initializeLabels();

        //All iFrames must be updated to English.
        if ($("#fraLogEQ").attr("src") !== "") {
            $("#fraLogEQ")[0].contentWindow.UITranslator.translate('LOGEQ');
        }
        if ($("#fraDNV").attr("src") !== "") {
            $("#fraDNV")[0].contentWindow.UITranslator.translate('DNV');
        }
        if ($("#fraCNV").attr("src") !== "") {
            $("#fraCNV")[0].contentWindow.UITranslator.translate('CNV');
        }

        //Switch view of the buttons (Bold = Active)
        $("#button-EN").addClass('active');
        $("#button-NL").removeClass('active');
    });

   
    // doh: helaas is er een tweede set van gelijke eventhandlers nodig voor de taalknoppen in het hoofdvenster

    $("#lang2-NL").click(function () {
        LogEXSession.setLanguage("NL");
        self.initializeLabels();

        //All iFrames must be updated to Dutch
        if ($("#fraLogEQ").attr("src") !== "") {
            $("#fraLogEQ")[0].contentWindow.UITranslator.translate('LOGEQ');
        }
        if ($("#fraDNV").attr("src") !== "") {
            $("#fraDNV")[0].contentWindow.UITranslator.translate('DNV');
        }
        if ($("#fraCNV").attr("src") !== "") {
            $("#fraCNV")[0].contentWindow.UITranslator.translate('CNV');
        }

        //Switch view of the buttons (Bold = Active)
        $("#lang2-NL").addClass('active');
        $("#lang2-EN").removeClass('active');
    });


    $("#lang2-EN").click(function () {
        LogEXSession.setLanguage("EN");
        self.initializeLabels();

        //All iFrames must be updated to English.
        if ($("#fraLogEQ").attr("src") !== "") {
            $("#fraLogEQ")[0].contentWindow.UITranslator.translate('LOGEQ');
        }
        if ($("#fraDNV").attr("src") !== "") {
            $("#fraDNV")[0].contentWindow.UITranslator.translate('DNV');
        }
        if ($("#fraCNV").attr("src") !== "") {
            $("#fraCNV")[0].contentWindow.UITranslator.translate('CNV');
        }

        //Switch view of the buttons (Bold = Active)
        $("#lang2-EN").addClass('active');
        $("#lang2-NL").removeClass('active');
    });

    $(BTN_LOGOUT).click(function () {
        LogEXSession.logout();
        LogEXSession.setStudentId($('#login-student-id').val());
        $("#login-student-id").val("");
        // doh: parameters zorgen ervoor dat modal niet gesloten wordt als er buiten de modal geklikt wordt
        $("#login").modal({ backdrop: 'static', keyboard: false });
        $("#login-student-id").focus();
        $("#login-student-id").kbinput('hide');
    });

    // doh: alleen voor test-doeleinden; waarom verschijnen de tooltips niet boven een modalform?
    //$('body').on('hover', 'a[rel=tooltip], a[rel=popover]', showZIndex);
}



