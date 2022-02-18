/**
    KeyBindings is responsible for handling the key strokes of the user.
    @constructor
    @param {LogEQController} logEQController - The ideas controller
 */
export class KeyBindings {
  constructor (controller) {
    this.controller = controller
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
          if (!document.getElementById('new-exercise-menu').classList.contains('show')) {
            this.switchFocus(false)
            e.preventDefault()
          } else {
            if (document.activeElement.parentNode.id === 'new-exercise-menu') {
              let newActive = document.activeElement.previousElementSibling
              while (newActive !== undefined && !newActive.classList.contains('dropdown-item')) {
                newActive = newActive.previousElementSibling
              }
              newActive.focus()
              e.preventDefault()
            } else {
              document.getElementById('new-exercise-menu').lastElementChild.focus()
              e.preventDefault()
            }
          }
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
        if (this.controller.exerciseType !== 'LOGIND') {
          this.showHint()
          e.preventDefault()
        }
      } else if (e.keyCode === 38) { // arrow up
        if (this.controller.exerciseType !== 'LOGAX') {
          const rule = document.getElementById('rule')
          if (rule.selectedIndex > 0) {
            rule.selectedIndex -= 1
            e.preventDefault()
          }
        }
      } else if (e.keyCode === 40) { // arrow down
        if (this.controller.exerciseType !== 'LOGAX') {
          const rule = document.getElementById('rule')
          if (rule.selectedIndex < rule.length - 1) {
            rule.selectedIndex += 1
            e.preventDefault()
          }
        }
      } else if (e.keyCode === 9) { // tab
        if (!document.getElementById('new-exercise-menu').classList.contains('show')) {
          this.switchFocus(true)
          e.preventDefault()
        } else {
          if (document.activeElement.parentNode.id === 'new-exercise-menu') {
            let newActive = document.activeElement.nextElementSibling
            while (newActive !== undefined && !newActive.classList.contains('dropdown-item')) {
              newActive = newActive.nextElementSibling
            }
            newActive.focus()
            e.preventDefault()
          } else {
            document.getElementById('new-exercise-menu').firstElementChild.focus()
            e.preventDefault()
          }
        }
      } else if (e.keyCode === 13) { // enter
        if (document.activeElement.parentNode.id === 'new-exercise-menu') {
          document.activeElement.click()
          e.preventDefault()
        } else if (document.getElementById('exercise-container').style.display === '') {
          this.controller.validateStep()
          e.preventDefault()
        } else if (document.getElementById('new-exercise-container').style.display === '') {
          this.controller.createExercise()
          e.preventDefault()
        }
      } else if (String.fromCharCode(e.keyCode).toLowerCase() === 'u') { // u
        this.controller.formulaPopover.undo()
        e.preventDefault()
      } else if (e.keyCode === 27) { // escape
        this.controller.clearErrors()
        this.controller.dismissAlert()
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
    if (['CNV', 'DNV'].includes(this.controller.exerciseType)) {
      this.controller.validateExercise()
    }
  }

  switchFocus (forward) {
    if (document.getElementById('new-exercise-container').style.display === '') {
      // new exercise menu
      switch (this.controller.exerciseType) {
        case 'CNV':
        case 'DNV':
          document.getElementById('new-formula').focus()
          break
        case 'LOGEQ':
          if (document.getElementById('new-formula-1') === document.activeElement) {
            document.getElementById('new-formula-2').focus()
          } else {
            document.getElementById('new-formula-1').focus()
          }
          break
        case 'LOGAX':
          switch (document.activeElement) {
            case document.getElementById('new-formula-1'):
              document.getElementById('new-formula-2').focus()
              break
            case document.getElementById('new-formula-2'):
              if (document.getElementById('lemma-row').style.display === '') {
                document.getElementById('new-lemma-1').focus()
              } else {
                document.getElementById('new-formula-1').focus()
              }
              break
            case document.getElementById('new-lemma-1'):
              document.getElementById('new-lemma-2').focus()
              break
            case document.getElementById('new-lemma-2'):
              document.getElementById('new-formula-1').focus()
              break
            default:
              document.getElementById('new-formula-1').focus()
              break
          }
          break
      }
    } else {
      switch (this.controller.exerciseType) {
        case 'CNV':
        case 'DNV':
        case 'LOGEQ':
          if (document.getElementById('formula') === document.activeElement) { // in exercise
            document.getElementById('rule').focus()
          } else {
            document.getElementById('formula').focus()
          }
          break
        case 'LOGAX':
          if (forward) {
            this.switchFocusLogAxRule()
          } else {
            this.switchFocusLogAxRuleBack()
          }
          break
      }
    }
  }

  switchFocusLogAxRule () {
    switch (document.activeElement) {
      case document.getElementById('rule'):
        switch (this.controller.ruleKey) {
          case 'logic.propositional.axiomatic.assumption':
          case 'logic.propositional.axiomatic.assumption.close':
          case 'logic.propositional.axiomatic.axiom-a':
          case 'logic.propositional.axiomatic.axiom-a.close':
          case 'logic.propositional.axiomatic.axiom-b':
          case 'logic.propositional.axiomatic.axiom-b.close':
          case 'logic.propositional.axiomatic.axiom-c':
          case 'logic.propositional.axiomatic.axiom-c.close':
            document.getElementById('subtype-select').focus()
            break
          case 'logic.propositional.axiomatic.modusponens':
            document.getElementById('modusponens-select-stepnr-1').focus()
            break
          case 'logic.propositional.axiomatic.deduction':
            document.getElementById('deduction-select-stepnr-1').focus()
            break
          case 'logic.propositional.axiomatic.goal':
            document.getElementById('goal-formula-phi').focus()
            break
        }
        break
      case document.getElementById('subtype-select'):
        switch (this.controller.ruleKey) {
          case 'logic.propositional.axiomatic.assumption':
            document.getElementById('assumption-formula-phi').focus()
            break
          case 'logic.propositional.axiomatic.assumption.close':
            document.getElementById('assumption-select-stepnr').focus()
            break
          case 'logic.propositional.axiomatic.axiom-a':
            document.getElementById('axiom-a-formula-phi').focus()
            break
          case 'logic.propositional.axiomatic.axiom-a.close':
            document.getElementById('axiom-a-select-stepnr').focus()
            break
          case 'logic.propositional.axiomatic.axiom-b':
            document.getElementById('axiom-b-formula-phi').focus()
            break
          case 'logic.propositional.axiomatic.axiom-b.close':
            document.getElementById('axiom-b-select-stepnr').focus()
            break
          case 'logic.propositional.axiomatic.axiom-c':
            document.getElementById('axiom-c-formula-phi').focus()
            break
          case 'logic.propositional.axiomatic.axiom-c.close':
            document.getElementById('axiom-c-select-stepnr').focus()
            break
          case 'logic.propositional.axiomatic.modusponens':
            document.getElementById('modusponens-select-stepnr-1').focus()
            break
          case 'logic.propositional.axiomatic.deduction':
            document.getElementById('deduction-select-stepnr-1').focus()
            break
          case 'logic.propositional.axiomatic.goal':
            document.getElementById('goal-formula-phi').focus()
        }
        break
      // Axiom A
      case document.getElementById('axiom-a-formula-phi'):
        document.getElementById('axiom-a-formula-psi').focus()
        break
      // Axiom B
      case document.getElementById('axiom-b-formula-phi'):
        document.getElementById('axiom-b-formula-psi').focus()
        break
      case document.getElementById('axiom-b-formula-psi'):
        document.getElementById('axiom-b-formula-chi').focus()
        break
      // Axiom C
      case document.getElementById('axiom-c-formula-phi'):
        document.getElementById('axiom-c-formula-psi').focus()
        break
      // Modus Ponens
      case document.getElementById('modusponens-select-stepnr-1'):
        document.getElementById('modusponens-select-stepnr-2').focus()
        break
      case document.getElementById('modusponens-select-stepnr-2'):
        document.getElementById('modusponens-select-stepnr-3').focus()
        break
      // Deduction
      case document.getElementById('deduction-select-stepnr-1'):
        if (!document.getElementById('deduction-formula-phi').disabled) {
          document.getElementById('deduction-formula-phi').focus()
        } else {
          document.getElementById('deduction-formula-stepnr-2').focus()
        }
        break
      case document.getElementById('deduction-formula-phi'):
        if (!document.getElementById('deduction-select-stepnr-2').disabled) {
          document.getElementById('deduction-select-stepnr-2').focus()
        } else {
          document.getElementById('rule').focus()
        }
        break
      // Goal
      case document.getElementById('goal-formula-phi'):
        document.getElementById('goal-formula-psi').focus()
        break
      case document.getElementById('goal-formula-psi'):
        document.getElementById('goal-stepnr').focus()
        break
      //
      default:
        document.getElementById('rule').focus()
        break
    }
  }

  switchFocusLogAxRuleBack () {
    switch (document.activeElement) {
      case document.getElementById('rule'):
        switch (this.controller.ruleKey) {
          case 'logic.propositional.axiomatic.assumption':
            document.getElementById('assumption-formula-phi').focus()
            break
          case 'logic.propositional.axiomatic.assumption.close':
            document.getElementById('assumption-select-stepnr').focus()
            break
          case 'logic.propositional.axiomatic.axiom-a':
            document.getElementById('axiom-a-formula-psi').focus()
            break
          case 'logic.propositional.axiomatic.axiom-a.close':
            document.getElementById('axiom-a-select-stepnr').focus()
            break
          case 'logic.propositional.axiomatic.axiom-b':
            document.getElementById('axiom-b-formula-chi').focus()
            break
          case 'logic.propositional.axiomatic.axiom-b.close':
            document.getElementById('axiom-b-select-stepnr').focus()
            break
          case 'logic.propositional.axiomatic.axiom-c':
            document.getElementById('axiom-c-formula-psi').focus()
            break
          case 'logic.propositional.axiomatic.axiom-c.close':
            document.getElementById('axiom-c-select-stepnr').focus()
            break
          case 'logic.propositional.axiomatic.modusponens':
            document.getElementById('modusponens-select-stepnr-3').focus()
            break
          case 'logic.propositional.axiomatic.deduction':
            if (!document.getElementById('deduction-select-stepnr-2').disabled) {
              document.getElementById('deduction-select-stepnr-2').focus()
            } else {
              document.getElementById('deduction-formula-phi').focus()
            }
            break
          case 'logic.propositional.axiomatic.goal':
            document.getElementById('goal-stepnr').focus()
            break
        }
        break
      // Subtype
      case document.getElementById('subtype-select'):
        document.getElementById('rule').focus()
        break
      // Axiom A
      case document.getElementById('axiom-a-formula-psi'):
        document.getElementById('axiom-a-formula-phi').focus()
        break
      // Axiom B
      case document.getElementById('axiom-b-formula-psi'):
        document.getElementById('axiom-b-formula-phi').focus()
        break
      case document.getElementById('axiom-b-formula-chi'):
        document.getElementById('axiom-b-formula-psi').focus()
        break
      // Axiom C
      case document.getElementById('axiom-c-formula-psi'):
        document.getElementById('axiom-c-formula-phi').focus()
        break
      // Modus Ponens
      case document.getElementById('modusponens-select-stepnr-1'):
        document.getElementById('rule').focus()
        break
      case document.getElementById('modusponens-select-stepnr-2'):
        document.getElementById('modusponens-select-stepnr-1').focus()
        break
      case document.getElementById('modusponens-select-stepnr-3'):
        document.getElementById('modusponens-select-stepnr-2').focus()
        break
      // Deduction
      case document.getElementById('deduction-select-stepnr-1'):
        document.getElementById('rule').focus()
        break
      case document.getElementById('deduction-select-stepnr-2'):
        if (!document.getElementById('deduction-formula-phi').disabled) {
          document.getElementById('deduction-formula-phi').focus()
        } else {
          document.getElementById('deduction-formula-stepnr-1').focus()
        }
        break
      case document.getElementById('deduction-formula-phi'):
        document.getElementById('deduction-select-stepnr-1').focus()
        break
      // Goal
      case document.getElementById('goal-formula-phi'):
        document.getElementById('rule').focus()
        break
      case document.getElementById('goal-formula-psi'):
        document.getElementById('goal-formula-phi').focus()
        break
      case document.getElementById('goal-stepnr'):
        document.getElementById('goal-formula-psi').focus()
        break
      //
      default:
        document.getElementById('subtype-select').focus()
        break
    }
  }

  removeTopStep () {
    if (['CNV', 'DNV'].includes(this.controller.exerciseType)) {
      this.controller.removeStep(this.controller.exercise.steps.steps.length)
    } else if (this.controller.exerciseType === 'LOGEQ') {
      this.controller.removeTopStep(this.controller.exercise.steps.topSteps.length)
    }
  }

  removeBottomStep () {
    if (this.controller.exerciseType === 'LOGEQ') {
      this.controller.removeBottomStep(this.controller.exercise.steps.bottomSteps.length)
    }
  }
}
