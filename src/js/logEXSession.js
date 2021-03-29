/**
    LogEXSession contains the session information, namely the student number of the logged in student, the language chosen, and the chosen level of difficulty of the exercises. LogEQSession is a thin layer over the HTML localStorage object. Using the localStorage object data temporarily can be stored in the web browser, see http://diveintohtml5.info/storage.html.
    @constructor
 */
export class LogEXSession {
  /**
        Initializes the session.
        @name LogEXSession#initialize
        @param {Number} studentId - The student id
        @param {String} difficulty - The chosen difficulty (default medium)
        @param {String} language - The language (default nl)
     */
  static initialize (studentId, difficulty, language) {
    localStorage.setItem('logex:studentId', studentId)
    localStorage.setItem('logex:difficulty', difficulty || 'medium')
    localStorage.setItem('logex:language', language || 'nl')
  }

  /**
        Gets the student id.
        @returns {Number} The student id
     */
  static getStudentId () {
    return localStorage.getItem('logex:studentId')
  }

  /**
        Gets the identifiers from localStorage and applies them to the state objectfor communication with IDEAS.
        @param {Dictionary} state - State object to be sent. Must contain exerciseid property
        @returns {Dictionary} the original state object with identifiers added
     */
  static applyIdentifiers (state) {
    const identifiers = JSON.parse(localStorage.getItem('logex:' + state.exerciseid))
    Object.assign(state, identifiers)

    return state
  }

  /**
        Gets the difficulty.
        @returns {String} The difficulty
     */
  static getDifficulty () {
    return localStorage.getItem('logex:difficulty')
  }

  /**
        Gets the language.
        @returns {String} The language
     */
  static getLanguage () {
    return localStorage.getItem('logex:language')
  }

  /**
        Sets the student id.
        @param {Number} studentId - The student id
     */
  static setStudentId (studentId) {
    localStorage.setItem('logex:studentId', studentId)
  }

  /**
        Sets the identifiers for communication with IDEAS with the exerciseId as a key.
        @param {String} exerciseId - The exercise id
        @param {String} Identifiers - The identifiers
     */
  static setIdentifiers (exerciseId, state) {
    const recordedState = {
      userid: state.userid,
      session: state.sessionid,
      taskid: state.taskid
    }
    localStorage.setItem('logex:' + exerciseId, JSON.stringify(recordedState))
  }

  /**
        Sets the difficulty.
        @param {String} difficulty - The difficulty
     */
  static setDifficulty (difficulty) {
    localStorage.setItem('logex:difficulty', difficulty)
  }

  /**
        Sets the language.
        @param {String} language - The language
     */
  static setLanguage (language) {
    localStorage.setItem('logex:language', language)
  }

  /**
        Logs the student out and clears the session information
     */
  static logout () {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i)
      if (key && key.indexOf('logex:') === 0) {
        localStorage.removeItem(key)
      }
    }
  }
};

// (function () {
//   // migrate top-level keys to the logex namespace
//   if (localStorage.getItem('studentId') && !localStorage.getItem('logex:studentId')) {
//     for (let i = 0, len = localStorage.length; i < len; i++) {
//       const key = localStorage.key(i)
//       if (key && key.indexOf('logex:') === -1 && key.indexOf('logax:') === -1) {
//         localStorage.setItem('logex:' + key, localStorage.getItem(key))
//       }
//     }
//     localStorage.removeItem('studentId')
//   }
// })()
