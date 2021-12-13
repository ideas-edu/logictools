import { ExerciseTypes } from '../exerciseTypes.js'
import { LogEXSession } from '../../logEXSession.js'
import { IdeasServiceProxy } from '../ideasServiceProxy.js'

// Abstract class for generator
export class ExerciseGenerator {
  constructor (config) {
    this.Exercise = undefined
    this.config = config
  }

  /**
        Generates a one way exercise.
        @param {string} ExerciseType - Type of exercise to be generated.  See exerciseTypes.js for the full list
        @param onExerciseGenerated - The callback function that is called after the exercise is generated.
        The callback function expects 1 parameter, the exercise.
        @param onErrorGeneratingExercise - The callback function that is called if there is a problem generating the exercise.
     */
  generate (exerciseType, properties, onExerciseGenerated, onErrorGeneratingExercise) {
    const exerciseId = ExerciseTypes[exerciseType]
    const userId = LogEXSession.getStudentId()
    const difficulty = properties.difficulty
    const onError = onErrorGeneratingExercise
    const onSuccess = function (data) {
      this.onSuccess(data.generate, exerciseId, onErrorGeneratingExercise, onExerciseGenerated, properties)
    }.bind(this)

    IdeasServiceProxy.generate(this.config, exerciseId, difficulty, userId, onSuccess, onError)
  }

  example (exerciseNr, exerciseType, properties, onExerciseGenerated, onErrorGeneratingExercise) {
    const exerciseId = ExerciseTypes[exerciseType]
    const userId = LogEXSession.getStudentId()
    const onError = onErrorGeneratingExercise
    const onSuccess = function (data) {
      // const test = {
      //   state: {
      //     context: {
      //       term: {}
      //     }
      //   }
      // }
      // test.state.context.term = {
      //       "active": null,
      //       "definitions":
      //       [
      //           "prop",
      //           "bin"
      //       ],
      //       "language":
      //       [
      //           "NEGATION",
      //           "AND",
      //           "IMPLIES"
      //       ],
      //       "problem": "Given a propositionsal language L with atoms p, q, r, ... and connectives &not;, &and; and &implies;.\nWe define two functions on this language:\na function prop counting all occurences of propositional letters and a function bin counting the number of binary connectives:\nprop(p) = 1 for any atomic formula \n prop(&not; &phi;) = prop(&phi;)\nprop(&phi; &box; &psi;) = prop(&phi;) + prop(&psi;), for &box; is &and; or &implies;\nbin(p) = 0 for any atomic formula\n bin(&not; &phi;) = bin(&phi;)\nbin(&phi; &box; &psi;) = bin(&phi;) + bin(&psi;) + 1, for &box; is &and; or &implies;\nProve with induction that prop(&phi;) = bin(&phi;) + 1 for any formule &phi; in the language L.",
      //       "proofs":
      //       {
      //           "AND":
      //           [
      //               "prop (phi&&psi)",
      //               {
      //                   "motivation": "prop",
      //                   "type": "="
      //               },
      //               "prop phi+prop psi",
      //               {
      //                   "motivation": "ih",
      //                   "type": "="
      //               },
      //               "bin phi+1+prop psi",
      //               {
      //                   "motivation": "ih",
      //                   "type": "="
      //               },
      //               "bin phi+1+bin psi+1",
      //               {
      //                   "motivation": "bin",
      //                   "type": "="
      //               },
      //               "bin (phi&&psi)+1"
      //           ],
      //           "IMPLIES":
      //           [
      //               "prop (phi->psi)",
      //               {
      //                   "motivation": "prop",
      //                   "type": "="
      //               },
      //               "prop phi+prop psi",
      //               {
      //                   "motivation": "ih",
      //                   "type": "="
      //               },
      //               "bin phi+1+prop psi",
      //               {
      //                   "motivation": "ih",
      //                   "type": "="
      //               },
      //               "bin phi+1+bin psi+1",
      //               {
      //                   "motivation": "bin",
      //                   "type": "="
      //               },
      //               "bin (phi->psi)+1"
      //           ],
      //           "NEGATION":
      //           [
      //               "prop (~phi)",
      //               {
      //                   "motivation": "prop",
      //                   "type": "="
      //               },
      //               "prop phi",
      //               {
      //                   "motivation": "ih",
      //                   "type": "="
      //               },
      //               "bin phi+1",
      //               {
      //                   "motivation": "bin",
      //                   "type": "="
      //               },
      //               "bin (~phi)+1"
      //           ],
      //           "p":
      //           [
      //               "prop p",
      //               {
      //                   "motivation": "prop",
      //                   "type": "="
      //               },
      //               "1",
      //               {
      //                   "motivation": "calculate",
      //                   "type": "="
      //               },
      //               "0+1",
      //               {
      //                   "motivation": "bin",
      //                   "type": "="
      //               },
      //               "bin p+1"
      //           ],
      //           "phi":
      //           [
      //               "prop phi",
      //               {
      //                   "motivation": "ih",
      //                   "type": "="
      //               },
      //               "bin phi+1"
      //           ],
      //           "psi":
      //           [
      //               "prop psi",
      //               {
      //                   "motivation": "ih",
      //                   "type": "="
      //               },
      //               "bin psi+1"
      //           ]
      //       },
      //       "theorem":
      //       [
      //           "prop phi",
      //           {
      //               "motivation": "?",
      //               "type": "="
      //           },
      //           "bin phi+1"
      //       ]
      //   }
      // this.onSuccess(test, exerciseId, onErrorGeneratingExercise, onExerciseGenerated, properties)
      this.onSuccess(data.example, exerciseId, onErrorGeneratingExercise, onExerciseGenerated, properties)
    }.bind(this)

    IdeasServiceProxy.example(this.config, exerciseId, exerciseNr, userId, onSuccess, onError)
  }

  /**
        Creates an exercise based on input from the user.
        @param onExerciseCreated - The callback function that is called after the exercise is created.
        @param onErrorCreatingExercise - The callback function that is called if there is a problem creating the exercise.
     */
  create (exerciseId, context, properties, onExerciseGenerated, onErrorGeneratingExercise) {
    const userId = LogEXSession.getStudentId()
    const onError = onErrorGeneratingExercise
    const onSuccess = function (data) {
      this.onSuccess(data.create, exerciseId, onErrorGeneratingExercise, onExerciseGenerated, properties)
    }.bind(this)

    IdeasServiceProxy.create(this.config, exerciseId, context, userId, onSuccess, onError)
  }

  onSuccess (result, exerciseId, onErrorGeneratingExercise, onExerciseGenerated, properties) {
    if (result === undefined || result.state === undefined || result.state.context.term === null) {
      onErrorGeneratingExercise()
    } else {
      LogEXSession.setIdentifiers(exerciseId, result.state)
      const exercise = new this.Exercise(result.state.context.term, exerciseId, properties)
      onExerciseGenerated(exercise)
    }
  }
}
