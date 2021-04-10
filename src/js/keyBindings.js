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
          document.getElementById('validate-exercise').click()
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
      if (e.keyCode === 67) { // ctrl-c
        // allow default action

      } else if (e.keyCode === 86) { // ctrl-v
        // allow default action

      } else if (e.keyCode === 88) { // ctrl-x
        // allow default action

      } else if (String.fromCharCode(e.keyCode).toLowerCase() === 'n') { // ctrl-n
        document.getElementById('generate-exercise-normal').click()
        e.preventDefault()
      } else if (String.fromCharCode(e.keyCode).toLowerCase() === 'y') { // ctrl-y
        document.getElementById('generate-exercise-normal').click()
        e.preventDefault()
      } else if (String.fromCharCode(e.keyCode).toLowerCase() === 'b') { // ctrl-b
        document.getElementById('generate-exercise-easy').click()
        e.preventDefault()
      } else if (String.fromCharCode(e.keyCode).toLowerCase() === 'm') { // ctrl-m
        document.getElementById('generate-exercise-difficult').click()
        e.preventDefault()
      } else if (e.keyCode === 13) { // ctrl-enter
        document.getElementById('show-next-step').click()
        e.preventDefault()
      } else if (e.keyCode === 191) { // ctrl-/
        document.getElementById('validate-exercise').click()
        e.preventDefault()
      } else if (e.keyCode === 192) { // ctrl-`
        document.getElementById('rule').selectedIndex = 1
      } else if (e.keyCode >= 49 && e.keyCode <= 57) { // ctrl-1 thru ctrl-9
        document.getElementById('rule').selectedIndex = e.keyCode - 47
        e.preventDefault()
      } else if (e.keyCode === 48) { // ctrl-0
        document.getElementById('rule').selectedIndex = 11
        e.preventDefault()
      } else if (e.keyCode === 189) { // ctrl--
        document.getElementById('rule').selectedIndex = 12
        e.preventDefault()
      } else if (e.keyCode === 187) { // ctrl-=
        document.getElementById('rule').selectedIndex = 13
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
    } else if (e.metaKey) {
      if (e.keyCode === 67) { // cmd-c
        // allow default action

      } else if (e.keyCode === 86) { // cmd-v
        // allow default action

      } else if (e.keyCode === 88) { // cmd-x
        // allow default action

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
        document.getElementById('validate-step').click()
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

  switchFocus () {
    if (document.getElementById('formula') === document.activeElement) {
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
