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
  static setStudentId (studentId, configTools) {	
    this.initializeStudentArrays(studentId, configTools)
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

  /**		
    Initializes the counters which will be used for the progressbars		
    Initializes the level exercises which have to be exercised by the student 		
    @param {Number} studentId - The student id		
  */		
  static initializeStudentArrays(studentId, configTools) {		
    let progressArray;		
    let levelExercisesArray;		
    let createEntryForUser = false;		
    progressArray = JSON.parse(localStorage.getItem('logex:progressArray'));		
    levelExercisesArray = JSON.parse(localStorage.getItem('logex:levelExercisesArray'));		
    if (progressArray === null)		
    {		
        progressArray = []		
        levelExercisesArray = []		
        createEntryForUser = true;		
    }		
    else		
    {		
      if (progressArray.find(x => x.studentId === studentId) === undefined){		
          createEntryForUser = true;		
      }		
    }		
    if (createEntryForUser)		
    {		
      progressArray.push({"studentId": studentId, "typeAantallen": { [this.DNV()]: [0,0,0], [this.CNV()]: [0,0,0], [this.LOGEQ()] : [0,0,0] }})		
      let DNV = configTools[this.DNV()].levelExercises !== undefined ? configTools[this.DNV()].levelExercises.exercises : null // Bijv. { "easy": [0, 1, 2], "medium": [3, 4, 5], "difficult" : [6, 7, 8] }		
      let CNV = configTools[this.CNV()].levelExercises !== undefined ? configTools[this.CNV()].levelExercises.exercises : null		
      let LOGEQ = configTools[this.LOGEQ()].levelExercises !== undefined ? configTools[this.LOGEQ()].levelExercises.exercises : null	

      levelExercisesArray.push({"studentId": studentId, [this.DNV()] : DNV, [this.CNV()]: CNV, [this.LOGEQ()] : LOGEQ})		
    }		
    localStorage.setItem('logex:progressArray', JSON.stringify(progressArray));		
    localStorage.setItem('logex:levelExercisesArray', JSON.stringify(levelExercisesArray));		
  }		
  /**		
    Adds the finished task to the counter-array which will be used for the progressbars		
  */		
  static updateProgressbarValues () {  		
    const Difficulties = {		
      easy: 0,		
      medium: 1,		
      difficult: 2		
    } 
    
    if (this.getStudentId() == null || this.getDifficulty() == null) {		
      return null		
    }		
    let progressArray = JSON.parse(localStorage.getItem('logex:progressArray')); // TODO : naar methode ?		
    let studentProgress = progressArray.find(x => x.studentId === this.getStudentId()).typeAantallen[this.getExerciseType()]		
    studentProgress[Difficulties[this.getDifficulty()]]++		
    localStorage.setItem('logex:progressArray', JSON.stringify(progressArray)); // TODO : naar methode ?		
    this.setLevelExerciseAsFinished()		
    return studentProgress		
  }		
  /**		
    Gets the counter-array which will be used for the progressbars		
  */		
  static getProgressbarValues () { 
      if (this.getStudentId() == null || this.getDifficulty() == null) {
      return null		
    }		
    let progressArray = JSON.parse(localStorage.getItem('logex:progressArray')); // TODO : naar methode ?		
    let studentProgress = progressArray.find(x => x.studentId === this.getStudentId()).typeAantallen[this.getExerciseType()]		
    return studentProgress		
  }		
  /**
    Gets number of exercise which is going to be performed. 
    No userid                                       : return -4 
    When all exercises are finished                 : return -3 
    When all exercises of type are finished         : return -2
    When all exercises of type + level are finished : return -1
    Else return number of type + level 
  */
    static getLevelExerciseNumber (exerciseType, difficulty) { 
      this.setDifficulty (difficulty) 
      this.setExerciseType (exerciseType) 

      let levelExercisesArray = localStorage.getItem('logex:levelExercisesArray')
      if (levelExercisesArray == null) {
        return -4
      }

      levelExercisesArray = JSON.parse(levelExercisesArray); 
      let studentExercises = levelExercisesArray.find(x => x.studentId === this.getStudentId())
   
      let dnv = this.DNV()
      let cnv = this.CNV()
      let logeq = this.LOGEQ()
      let e = this.easy()
      let m = this.medium()
      let d = this.difficult()
      let allExercises = {[dnv]: [], [cnv]: [], [logeq] : []}
  
      if (studentExercises[dnv] !== null) {
        allExercises[dnv] = studentExercises[dnv][e].concat(studentExercises[dnv][m], studentExercises[dnv][d]) 
      }
      if (studentExercises[cnv] !== null) {
        allExercises[cnv] = studentExercises[cnv][e].concat(studentExercises[cnv][m], studentExercises[cnv][d])
      }
      if (studentExercises[logeq] !== null) {
        allExercises[logeq] = studentExercises[logeq][e].concat(studentExercises[logeq][m], studentExercises[logeq][d])
      }
      // Get exercisenumber of same type and level
      let nextExerciseNumber = studentExercises[this.getExerciseType()][this.getDifficulty()].find(e => e !== -1)
      // if not available determine which error has to be shown
      if (nextExerciseNumber === undefined) {
        // Are all exercises completed?
        nextExerciseNumber = allExercises[dnv].concat(allExercises[cnv], allExercises[logeq]).find(e => e !== -1)
        if (nextExerciseNumber === undefined) {
          nextExerciseNumber = -3
        }
        // Are all exercises of type completed (but not of all types)?
        else { 
          nextExerciseNumber = allExercises[this.getExerciseType()].find(e => e !== -1)
          if (nextExerciseNumber === undefined) {
            nextExerciseNumber = -2
          }
          // Are all exercises of type + level completed (but not all levels)?
          else {
              nextExerciseNumber = -1
          }
        }
      }
      this.setExerciseNumber(nextExerciseNumber)
      return nextExerciseNumber
    }
  
    /**
      Sets number of exercise which has been performed to -1 
    */
    static setLevelExerciseAsFinished () {  
      let levelExercisesArray = JSON.parse(localStorage.getItem('logex:levelExercisesArray')); 
      let studentExercises = levelExercisesArray.find(x => x.studentId === this.getStudentId())
      let index = studentExercises[this.getExerciseType()][this.getDifficulty()].indexOf(parseInt(this.getExerciseNumber()));
      studentExercises[this.getExerciseType()][this.getDifficulty()][index] = -1
      localStorage.setItem('logex:levelExercisesArray', JSON.stringify(levelExercisesArray)); 
    }
  
    static getNumberOfExercises(difficulty) {  
      let levelExercisesArray = JSON.parse(localStorage.getItem('logex:levelExercisesArray')); 
      let studentExercises = levelExercisesArray.find(x => x.studentId === this.getStudentId())
      let length = studentExercises[this.getExerciseType()][difficulty].length;
      return length
    }
    static setExerciseType (exerciseType) {
      localStorage.setItem('logex:exerciseType', exerciseType)
    }
    static getExerciseType () {
      return localStorage.getItem('logex:exerciseType')
    }
    static setDifficulty (difficulty) {
      localStorage.setItem('logex:difficulty', difficulty)
    }
    static setExerciseNumber (exerciseNumber) {
      localStorage.setItem('logex:exerciseNumber', exerciseNumber)
    }
    static getExerciseNumber () {
      return localStorage.getItem('logex:exerciseNumber')
    }
    static getDifficulty () {
      return localStorage.getItem('logex:difficulty')
    }
    static DNV () {
      return "DNV"
    }
    static CNV () {
      return "CNV"
    }
    static LOGEQ () {
      return "LOGEQ"
    }
    static easy () {
      return "easy"
    }
    static medium () {
      return "medium"
    }
    static difficult () {
      return "difficult"
    }
};
