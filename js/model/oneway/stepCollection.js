/*global Rules */
/**
    OneWayStepCollection is an ordered list of conversion steps.
    @constructor
    @param {ProofStep} baseStep - The first proof step.
 */
function OneWayStepCollection(baseStep) {
    "use strict";

    this.steps = [];
    if (baseStep !== null) {
        this.steps.push(baseStep);
    }

    /**
        Gets the current step.
        @return {OneWayStep} The current step.
     */
    this.getCurrentStep = function () {
        return this.steps[this.steps.length - 1];
    };

    /**
        Gets the previous step.
        @return {ProofStep} The previous step.
     */
    this.getPreviousStep = function () {
        if (this.steps.length === 1) {
            return baseStep;
        }
        return this.steps[this.steps.length - 2];
    };

    /**
        Gets all the steps.
        @return {OneWayStep[]} The steps.
     */
    this.getSteps = function () {
        return this.steps;
    };

    /**
        Adds a one way step to the collection.
        @param {OneWayStep} onewayStep - The oneway step.
     */
    this.push = function (onewayStep) {
        // deze stappen filteren we eruit omdat dit geen stappen zijn die een normale gebruiker zou doen
        if (Rules[onewayStep.rule] === null) {
            return;
        }
        this.steps.push(onewayStep);
    };
    /**
        Removes the latest oneway step from the collection.
     */
    this.pop = function () {
        this.steps.pop();
    };

    /**
        Removes the top steps starting from the specified index.
        @param {Number} index - The start index.
     */
    this.removeTopSteps = function (index) {
        this.steps = this.steps.slice(0, index + 1);
    };
}