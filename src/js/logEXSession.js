/**
    LogEXSession contains the session information, namely the student number of the logged in student, the language chosen, and the chosen level of difficulty of the exercises. LogEQSession is a thin layer over the HTML localStorage object. Using the localStorage object data temporarily can be stored in the web browser, see http://diveintohtml5.info/storage.html.
    @constructor
 */
export class LogEXSession {
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
        Sets the language.
        @param {String} language - The language
     */
  static setLanguage (language) {
    localStorage.setItem('logex:language', language)
  }
};
