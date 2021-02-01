/*global Resources, LogEXSession, TwoWayExercise, IdeasServiceProxy */
/**
    ExerciseGenerator is responsible for generating exercises.
    @constructor
 */
function TwoWayExerciseGenerator() {
    "use strict";

    /**
        Generates an exercise.
        @param ExerciseType - Type of exercise to be generated.  See exerciseTypes.js for the full list
        @param onExerciseGenerated - The callback function that is called after the exercise is generated.
        The callback function expects 1 parameter, the exercise.
        @param onErrorGeneratingExercise - The callback function that is called if there is a problem generating the exercise.
     */
    this.generate = function (exerciseType, stepValidation, onExerciseGenerated, onErrorGeneratingExercise) {
        var exerciseId = Resources.getExerciseMethod(exerciseType),
			userId = LogEXSession.getStudentId(),
            difficulty = LogEXSession.getDifficulty(),
            onError = onErrorGeneratingExercise,

            onSuccess = function (data) {
                if (data === null || data.error !== null || data.result === null || data.result[2] === null) {
                    onErrorGeneratingExercise();
                } else {
					LogEXSession.setIdentifiers(exerciseId, data.result[4]);
                    var exercise = new TwoWayExercise(data.result[2], exerciseId, stepValidation);
                    onExerciseGenerated(exercise);
                }
            };

        IdeasServiceProxy.generate(exerciseId, difficulty, userId, onSuccess, onError);
    };
	
	/**
        Get an example exercise.
		@param ExerciseNr - Exercise number
        @param ExerciseType - Type of exercise to be generated.  See exerciseTypes.js for the full list
        @param onExerciseGenerated - The callback function that is called after the exercise is generated.
        The callback function expects 1 parameter, the exercise.
        @param onErrorGeneratingExercise - The callback function that is called if there is a problem generating the exercise.
     */
	
	this.example = function (exerciseNr, exerciseType, stepValidation, onExerciseGenerated, onErrorGeneratingExercise) {
        var exerciseId = Resources.getExerciseMethod(exerciseType),
			 userId = LogEXSession.getStudentId(),
            onError = onErrorGeneratingExercise,
            onSuccess = function (data) {
                if (data === null || data.error !== null || data.result === null || data.result[2] === null) {
                    onErrorGeneratingExercise();
                } else {
                    LogEXSession.setIdentifiers(exerciseId, data.result[4]);
                    var exercise = new TwoWayExercise(data.result[2], exerciseId, stepValidation);
                    onExerciseGenerated(exercise);
                }
            };
        IdeasServiceProxy.example(exerciseId, exerciseNr, userId, onSuccess, onError);
    };
}
