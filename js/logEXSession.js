/* global localStorage */
/**
    LogEXSession contains the session information, namely the student number of the logged in student, the language chosen, and the chosen level of difficulty of the exercises. LogEQSession is a thin layer over the HTML localStorage object. Using the localStorage object data temporarily can be stored in the web browser, see http://diveintohtml5.info/storage.html.
    @constructor
 */
const LogEXSession = {

  /**
        Initializes the session.
        @name LogEXSession#initialize
        @param {Number} studentId - The student id
        @param {String} difficulty - The chosen difficulty (default medium)
        @param {String} language - The language (default NL)
     */
  initialize: function (studentId, difficulty, language) {
    'use strict'
    localStorage.setItem('logex:studentId', studentId)
    localStorage.setItem('logex:difficulty', difficulty || 'medium')
    localStorage.setItem('logex:language', language || 'NL')
  },

  /**
        Gets the student id.
        @returns {Number} The student id
     */
  getStudentId: function () {
    'use strict'
    return localStorage.getItem('logex:studentId')
  },

  /**
        Gets the identifiers for communication with IDEAS.
    @param {String} exerciseId - The exercise id
        @returns {Array} The identifiers
     */
  getIdentifiers: function (exerciseId) {
    'use strict'
    const identifiers = localStorage.getItem('logex:' + exerciseId)

    // Make an array of strings of the string
    return identifiers.split(',')
  },

  /**
        Gets the difficulty.
        @returns {String} The difficulty
     */
  getDifficulty: function () {
    'use strict'
    return localStorage.getItem('logex:difficulty')
  },

  /**
        Gets the language.
        @returns {String} The language
     */
  getLanguage: function () {
    'use strict'
    return localStorage.getItem('logex:language')
  },

  /**
        Sets the student id.
        @param {Number} studentId - The student id
     */
  setStudentId: function (studentId) {
    'use strict'
    localStorage.setItem('logex:studentId', studentId)
  },

  /**
        Sets the identifiers for communication with IDEAS
    with the exerciseId as a key.
    @param {String} exerciseId - The exercise id
        @param {String} Identifiers - The identifiers
     */
  setIdentifiers: function (exerciseId, identifiers) {
    'use strict'
    localStorage.setItem('logex:' + exerciseId, identifiers)
  },

  /**
        Sets the difficulty.
        @param {String} difficulty - The difficulty
     */
  setDifficulty: function (difficulty) {
    'use strict'
    localStorage.setItem('logex:difficulty', difficulty)
  },

  /**
        Sets the language.
        @param {String} language - The language
     */
  setLanguage: function (language) {
    'use strict'
    localStorage.setItem('logex:language', language)
  },

  /**
        Logs the student out and clears the session information
     */
  logout: function () {
    'use strict'
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i)
      if (key && key.indexOf('logex:') === 0) {
        localStorage.removeItem(key)
      }
    }
  }
};

(function () {
  // migrate top-level keys to the logex namespace
  if (localStorage.getItem('studentId') && !localStorage.getItem('logex:studentId')) {
    for (let i = 0, len = localStorage.length; i < len; i++) {
      const key = localStorage.key(i)
      if (key && key.indexOf('logex:') === -1 && key.indexOf('logax:') === -1) {
        localStorage.setItem('logex:' + key, localStorage.getItem(key))
      }
    }
    localStorage.removeItem('studentId')
  }
})()
