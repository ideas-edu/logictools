/**
    Configuration options
 */
export const config = {
  tools: [
    {
      code: 'dnf',
      url: 'oneway.html?exerciseType=DNV'
    },
    {
      code: 'cnf',
      url: 'oneway.html?exerciseType=CNV'
    },
    {
      code: 'logeq',
      url: 'twoway.html?exerciseType=LOGEQ'
    },
    {
      code: 'help',
      url: 'help.html'
    },
  ],

  // Example exercises
  exampleExercises: {
    CNV: [0, 1, 2, 3, 4],
    DNV: [0, 1, 2, 3, 4],
    LOGEQ: [0, 15, 16, 29, 30]
  },
  randomExercises: true,
  inputOwnExercise: true,
  source: 'logex',
  backend_url: 'https://ideas.science.uu.nl/cgi-bin/ideas-logic.cgi',
  useRuleJustification: true,
  displayRuleJustification: false,
  useStepValidation: true,
  displayStepValidation: false,
  displayHintButton: true,
  displayNextStepButton: true,
  displayDerivationButton: true
}
