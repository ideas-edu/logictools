/*global BuggyRules, Rules, Texts, exerciseTypes */
/**
    Resources contains the logic for returning user interface resources in the correct culture.
    @constructor
 */
var Resources = {

    /**
        Gets the index number of the specified language.
        @param {string} language - The language { "NL" | "EN" }
        @return {Number} The index number of the language. ( 0 = NL, 1 = EN )
     */
    getLanguageIndex: function (language) {
        "use strict";

        switch (language) {
        case "NL":
            return 0;
        case "EN":
            return 1;
        default:
            return 0;
        }
    },

    /**
        Gets the culture specific message for the specified buggy rule.
        @param {string} language - The language { "NL" | "EN" }
        @param {string} buggyRule - The buggy rule       
        @return {string} The message for the buggy rule.
        
     */
    getMessageForBuggyRule: function (language, buggyRule) {
        "use strict";
        var message;

        if (BuggyRules.hasOwnProperty(buggyRule) && BuggyRules[buggyRule].length >= this.getLanguageIndex(language) + 1) {
            message = BuggyRules[buggyRule][this.getLanguageIndex(language)];
        } else {
            message = buggyRule + " undefined";
        }
        return message;
    },

    /**
        Gets the culture specific message for the specified message.
        @param {string} language - The language  { "NL" | "EN" }
        @param {string} message - The message       
        @return {string} The culture specific message.
     */
    getSpecificMessage: function (language, message) {
        "use strict";

        return this.getText(language, message);
    },

    /**
        Gets the culture specific message for the specified rule.
        @param {string} language - The language
        @param {string} rule - The rule       
        @return {string} The culture specific message.
     */
    getUseRuleMessage: function (language, rule) {
        "use strict";

        return this.getText(language, "use") + this.getRule(language, rule) + "'.";
    },

    /**
        Gets the culture specific full hint for the specified rule.
        @param {string} language - The language  { "NL" | "EN" }
        @param {string} rule - The rule
        @param {string} formula - The formula
        @return {string} The culture specific message.
     */
    getFullHintMessage: function (language, rule, formula) {
        "use strict";

        return this.getText(language, "fullhint1") + this.getRule(language, rule) + this.getText(language, "fullhint2") + formula + "'.";
    },

    /**
        Gets the culture specific rule name for the specified rule.
        @param {string} language - The language  { "NL" | "EN" }
        @param {string} rule - The rule             
        @return {string} The culture specific rule name.
     */
    getRule: function (language, rule) {
        "use strict";
        var retVal;

        if (Rules.hasOwnProperty(rule) && Rules[rule].length >= this.getLanguageIndex(language) + 1) {
            retVal = (Rules[rule][this.getLanguageIndex(language)]);
        } else {
            retVal = (rule + " undefined");
        }
        return retVal;
    },

    /**
        Gets a culture specific text.
        @param {string} language - The language  { "NL" | "EN" }
        @param {string} text - The text id             
        @return {string} The culture specific text.
     */
    getText: function (language, text) {
        "use strict";
        var retVal;

        if (Texts.hasOwnProperty(text) && Texts[text].length >= this.getLanguageIndex(language) + 1) {
            retVal = (Texts[text][this.getLanguageIndex(language)]);
        } else {
            retVal = (text + " undefined");
        }
        return retVal;
    },

    /**
        Translates an exercise to its name used in the IDEAS Domain Reasoner
        @param {string} exerciseType - Type of the exercise { "CNV" | "DNV" | "LOGEQ" }
        @return {string) identifier as used in the IDEAS Domain Reasoner
    */
    getExerciseMethod: function (exerciseType) {
        "use strict";
        var retVal;

        if (exerciseTypes.hasOwnProperty(exerciseType.toUpperCase())) {
            retVal = exerciseTypes[exerciseType.toUpperCase()];
        } else {
            retVal = (exerciseType + " undefined");
        }
        return retVal;
    },

    /**
        Gets the culture specific message for an syntactic incorrect formula
        @param {string} language - The language  { "NL" | "EN" }
        @return {string} the message indicating a syntactic wrong formula was given
    */
    getInvalidFormulaMessage: function (language) {
        "use strict";
        var retVal;

        //JSLINT old code
        //if (Texts.hasOwnProperty("invalidformula") && Texts["invalidformula"].length >= this.getLanguageIndex(language) + 1) {
        //    retVal = (Texts["invalidformula"][this.getLanguageIndex(language)]);

        if (Texts.hasOwnProperty("invalidformula") && Texts.invalidformula.length >= this.getLanguageIndex(language) + 1) {
            retVal = (Texts.invalidformula[this.getLanguageIndex(language)]);
        } else {
            retVal = "invalidformula undefined";
        }
        return retVal;
    }
};