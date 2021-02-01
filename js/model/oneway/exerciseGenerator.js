/*global Resources, LogEXSession, OneWayExercise, IdeasServiceProxy */
function OneWayExerciseGenerator() {
    "use strict";

    /**
        Generates a one way exercise.
        @param {string} ExerciseType - Type of exercise to be generated.  See exerciseTypes.js for the full list
        @param onExerciseGenerated - The callback function that is called after the exercise is generated.
        The callback function expects 1 parameter, the exercise.
        @param onErrorGeneratingExercise - The callback function that is called if there is a problem generating the exercise.
     */
    this.generate = function (exerciseType, ruleJustification, stepValidation, onExerciseGenerated, onErrorGeneratingExercise) {
        var exerciseId = Resources.getExerciseMethod(exerciseType),
		    userId = LogEXSession.getStudentId(),
            difficulty = LogEXSession.getDifficulty(),
            onError = onErrorGeneratingExercise,
            onSuccess = function (data) {
                if (data === null || data.error !== null || data.result === null || data.result[2] === null) {
                    onErrorGeneratingExercise();
                } else {
					LogEXSession.setIdentifiers(exerciseId, data.result[4]);
                    var exercise = new OneWayExercise(data.result[2], exerciseId, ruleJustification, stepValidation);
                    onExerciseGenerated(exercise);
                }
            };
        IdeasServiceProxy.generate(exerciseId, difficulty, userId, onSuccess, onError);
    };
	
	this.example = function (exerciseNr, exerciseType, ruleJustification, stepValidation, onExerciseGenerated, onErrorGeneratingExercise) {
        var exerciseId = Resources.getExerciseMethod(exerciseType),
			 userId = LogEXSession.getStudentId(),
            onError = onErrorGeneratingExercise,
            onSuccess = function (data) {
                if (data === null || data.error !== null || data.result === null || data.result[2] === null) {
                    onErrorGeneratingExercise();
                } else {
					LogEXSession.setIdentifiers(exerciseId, data.result[4]);
                    var exercise = new OneWayExercise(data.result[2], exerciseId, ruleJustification, stepValidation);
                    onExerciseGenerated(exercise);
                }
            };
        IdeasServiceProxy.example(exerciseId, exerciseNr, userId, onSuccess, onError);
    };
}