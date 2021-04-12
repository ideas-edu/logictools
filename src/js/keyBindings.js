/**
    KeyBindings is responsible for handling the key strokes of the user.
    @constructor
    @param {LogEQController} logEQController - The ideas controller
 */
export class KeyBindings {
  constructor (logEQController) {
    this.logEQController = logEQController
  }

  /**
        Handles the key down event.
        @param e - The event
     */
  onKeyDown (e) {
    if (e.shiftKey) { // shift key bindings
      if (e.ctrlKey) { // ctrl-shift key bindings
        if (e.keyCode === 13) { // ctrl-shift-enter
          document.getElementById('solve-exercise').click()
          e.preventDefault()
        } else if (e.keyCode === 191) { // ctrl-?
          this.validateExercise()
          e.preventDefault()
        }
      } else {
        if (e.keyCode === 191) { // ?
          this.showHint()
          e.preventDefault()
        } else if (e.keyCode === 9) { // shift-tab
          this.switchFocus()
          e.preventDefault()
        }
      }
    } else if (e.ctrlKey) {
      // ctrl key bindings
      if (e.keyCode === 13) { // ctrl-enter
        document.getElementById('show-next-step').click()
        e.preventDefault()
      } else if (e.keyCode === 191) { // ctrl-/
        this.validateExercise()
        e.preventDefault()
      } else if (e.keyCode === 40) { // ctrl-down
        this.removeBottomStep()
        e.preventDefault()
      } else if (e.keyCode === 38) { // ctrl-up
        this.removeTopStep()
        e.preventDefault()
      }
    } else if (e.altKey) {
      if (e.keyCode === 40) { // alt-down
        this.removeBottomStep()
        e.preventDefault()
      } else if (e.keyCode === 38) { // alt-up
        this.removeTopStep()
        e.preventDefault()
      }
    } else {
      // geen ctrl, alt, command of shift bindings
      if (e.keyCode === 191) { // /
        this.showHint()
        e.preventDefault()
      } else if (e.keyCode === 38) { // arrow up
        const rule = document.getElementById('rule')
        if (rule.selectedIndex > 0) {
          rule.selectedIndex -= 1
        }
      } else if (e.keyCode === 40) { // arrow down
        const rule = document.getElementById('rule')
        if (rule.selectedIndex < rule.length - 1) {
          rule.selectedIndex += 1
        }
      } else if (e.keyCode === 9) { // tab
        this.switchFocus()
        e.preventDefault()
      } else if (e.keyCode === 13) { // enter
        if (document.getElementById('exercise-alert-container').style.display === '') {
          document.getElementById('validate-step').click()
        } else if (document.getElementById('new-exercise-alert-container').style.display === '') {
          document.getElementById('create-exercise').click()
        }
        e.preventDefault()
      } else if (String.fromCharCode(e.keyCode).toLowerCase() === 'u') { // u
        this.logEQController.formulaPopover.undo()
        e.preventDefault()
      } else if (e.keyCode === 27) { // escape
        this.logEQController.clearErrors()
        this.logEQController.dismissAlert()
        e.preventDefault()
      }
    }
  }

  showHint () {
    if (document.getElementById('exercise-alert').classList.contains('hint-alert') && document.getElementById('exercise-alert-container').style.display === '') {
      document.getElementById('exercise-alert-button').click()
    } else {
      document.getElementById('show-hint').click()
    }
  }

  validateExercise () {
    if (['CNV', 'DNV'].includes(this.logEQController.exerciseType)) {
      this.logEQController.validateExercise()
    }
  }

  switchFocus () {
    if (document.getElementById('new-exercise-container').style.display === '') {
      // new exercise menu
      if (['CNV', 'DNV'].includes(this.logEQController.exerciseType)) {
        document.getElementById('new-formula').focus()
      } else {
        if (document.getElementById('new-formula-1') === document.activeElement) {
          document.getElementById('new-formula-2').focus()
        } else {
          document.getElementById('new-formula-1').focus()
        }
      }
    } else if (document.getElementById('formula') === document.activeElement) { // in exercise
      document.getElementById('rule').focus()
    } else {
      document.getElementById('formula').focus()
    }
  }

  removeTopStep () {
    if (['CNV', 'DNV'].includes(this.logEQController.exerciseType)) {
      this.logEQController.removeStep(this.logEQController.exercise.steps.steps.length)
    } else if (this.logEQController.exerciseType === 'LOGEQ') {
      this.logEQController.removeTopStep(this.logEQController.exercise.steps.topSteps.length)
    }
  }

  removeBottomStep () {
    if (this.logEQController.exerciseType === 'LOGEQ') {
      this.logEQController.removeBottomStep(this.logEQController.exercise.steps.bottomSteps.length)
    }
  }
}
