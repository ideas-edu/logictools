/* global $ */
/**
    KeyBindings is responsible for handling the key strokes of the user.
    @constructor
    @param {LogEQController} logEQController - The ideas controller
 */
export function KeyBindings (logEQController) {
  'use strict'
  this.logEQController = logEQController

  /**
        Handles the key down event.
        @param e - The event
     */
  this.onKeyDown = function (e) {
    if (e.shiftKey) { // shift key bindings
      if (e.ctrlKey) { // ctrl-shift key bindings
        if (e.keyCode === 13) { // ctrl-shift-enter
          $('#solve-exercise').click()
          e.preventDefault()
        } else if (e.keyCode === 191) {
          $('#validate-exercise').click()
          e.preventDefault()
        } else if (String.fromCharCode(e.keyCode).toLowerCase() === 'n') { // ctrl-?
          $('#new-exercise').click()
          e.preventDefault()
        } else if (String.fromCharCode(e.keyCode).toLowerCase() === 'y') { // ctrl-shift-n
          $('#new-exercise').click()
          e.preventDefault()
        } // ctrl-shift-y
      } else {
        if (e.keyCode === 191) {
          if ($('#hint1').length !== 0) {
            $('#toggle-hint1').click()
          } else if ($('#hint2').length !== 0) {
            $('#toggle-hint2').click()
          } else if ($('#hint3').length !== 0) {
            $('#show-next-step').click()
          } else {
            $('#show-hint').click()
          }
          e.preventDefault()
        } else if (e.keyCode === 9) { // ?
          if ($('#rule').is(':focus')) {
            $('#formula2').focus()
          } else if ($('#formula2').is(':focus')) {
            $('#formula1').focus()
          } else if ($('#formula1').is(':focus') && !$('#validate-step').attr('disabled')) {
            $('#validate-step').focus()
          } else {
            $('#rule').focus()
          }
          e.preventDefault()
        } // shift-tab
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
        $('#generate-exercise').click()
        e.preventDefault()
      } else if (String.fromCharCode(e.keyCode).toLowerCase() === 'y') { // ctrl-y
        $('#generate-exercise').click()
        e.preventDefault()
      } else if (String.fromCharCode(e.keyCode).toLowerCase() === 'b') { // ctrl-b
        $('#generate-exercise-easy').click()
        e.preventDefault()
      } else if (String.fromCharCode(e.keyCode).toLowerCase() === 'm') { // ctrl-m
        $('#generate-exercise-difficult').click()
        e.preventDefault()
      } else if (e.keyCode === 13) { // ctrl-enter
        $('#show-next-step').click()
        e.preventDefault()
      } else if (e.keyCode === 191) { // ctrl-/
        $('#validate-exercise').click()
        e.preventDefault()
      } else if (e.keyCode === 49) { // ctrl-1
        $('#rule').prop('selectedIndex', 1)
        $('#rule').change()
        e.preventDefault()
      } else if (e.keyCode === 50) { // ctrl-2
        $('#rule').prop('selectedIndex', 2)
        $('#rule').change()
        e.preventDefault()
      } else if (e.keyCode === 51) { // ctrl-3
        $('#rule').prop('selectedIndex', 3)
        $('#rule').change()
        e.preventDefault()
      } else if (e.keyCode === 52) { // ctrl-4
        $('#rule').prop('selectedIndex', 4)
        $('#rule').change()
        e.preventDefault()
      } else if (e.keyCode === 53) { // ctrl-5
        $('#rule').prop('selectedIndex', 5)
        $('#rule').change()
        e.preventDefault()
      } else if (e.keyCode === 54) { // ctrl-6
        $('#rule').prop('selectedIndex', 6)
        $('#rule').change()
        e.preventDefault()
      } else if (e.keyCode === 55) { // ctrl-7
        $('#rule').prop('selectedIndex', 7)
        $('#rule').change()
        e.preventDefault()
      } else if (e.keyCode === 56) { // ctrl-8
        $('#rule').prop('selectedIndex', 8)
        $('#rule').change()
        e.preventDefault()
      } else if (e.keyCode === 57) { // ctrl-9
        $('#rule').prop('selectedIndex', 9)
        $('#rule').change()
        e.preventDefault()
      } else if (e.keyCode === 48) { // ctrl-0
        $('#rule').prop('selectedIndex', 10)
        $('#rule').change()
        e.preventDefault()
      } else if (e.keyCode === 189) { // ctrl--
        $('#rule').prop('selectedIndex', 11)
        $('#rule').change()
        e.preventDefault()
      } else if (e.keyCode === 187) { // ctrl-=
        $('#rule').prop('selectedIndex', 12)
        $('#rule').change()
        e.preventDefault()
      } else if (e.keyCode === 40) { // ctrl-down
        this.logEQController.removeBottomStep($('button.remove-bottom-step').first())
        e.preventDefault()
      } else if (e.keyCode === 38) { // ctrl-up
        this.logEQController.removeTopStep($('button.remove-top-step').last())
        e.preventDefault()
      } else if (String.fromCharCode(e.keyCode).toLowerCase() === 'd') { // ctrl-d
        this.logEQController.removeBottomStep($('button.remove-bottom-step').first())
        e.preventDefault()
      } else if (String.fromCharCode(e.keyCode).toLowerCase() === 'e') { // ctrl-e
        this.logEQController.removeTopStep($('button.remove-top-step').last())
        e.preventDefault()
      }
    } else if (e.altKey) {
      if (e.keyCode === 40) { // alt-down
        this.logEQController.removeBottomStep($('button.remove-bottom-step').first())
        e.preventDefault()
      } else if (e.keyCode === 38) { // alt-up
        this.logEQController.removeTopStep($('button.remove-top-step').last())
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
        if ($('#hint1').length !== 0) {
          $('#toggle-hint1').click()
        } else if ($('#hint2').length !== 0) {
          $('#toggle-hint2').click()
        } else if ($('#hint3').length !== 0) {
          $('#show-next-step').click()
        } else {
          $('#show-hint').click()
        }
        e.preventDefault()
      } else if (e.keyCode === 38) { // arrow up
        if ($('#rule').prop('selectedIndex') > 0) {
          $('#rule').prop('selectedIndex', $('#rule').prop('selectedIndex') - 1)
        }
        $('#rule').change()
      } else if (e.keyCode === 40) { // arrow down
        if ($('#rule').prop('selectedIndex') < $('#rule option').size() - 1) {
          $('#rule').prop('selectedIndex', $('#rule').prop('selectedIndex') + 1)
        }
        $('#rule').change()
      } else if (e.keyCode === 9) { // tab
        if ($('#formula1').is(':focus')) {
          $('#formula2').focus()
        } else if ($('#formula2').is(':focus')) {
          if (($('#new-exercise-content').length === 0)) {
            $('#rule').focus()
          } else {
            $('#create-exercise-button').focus()
          }
        } else if ($('#rule').is(':focus') && !$('#validate-step').attr('disabled')) {
          $('#validate-step').focus()
        } else {
          $('#formula1').focus()
        }
        e.preventDefault()
      } else if (e.keyCode === 13) { // enter
        if ($('#new-exercise-content').length === 0) { // Standaard actie bij valideren stap
          $('#validate-step').click()
        } else if (!($('#new-exercise-content').length === 0)) { // submit bij toevoegen handmatige opgave
          $('#create-exercise-button').click()
        } else {
          $('#rule').change()
        }
        e.preventDefault()
      } else if (String.fromCharCode(e.keyCode).toLowerCase() === 'u') { // u
        e.preventDefault()
        if ($('#formula1').is(':focus')) {
          $('#formula1').formulaPopover('undo')
        } else {
          $('#formula2').formulaPopover('undo')
        }
      } else if (e.keyCode === 27) { // escape
        this.logEQController.clearErrors()

        $('#formula1').popover('destroy')
        $('#formula2').popover('destroy')
        $('#equivsign').popover('destroy')
        e.preventDefault()
      }
    }
  }
}
