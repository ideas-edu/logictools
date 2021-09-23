import katex from 'katex'

// Sets location of cursor in inputElement
function setCursor (inputElement, start, end) {
  if (arguments.length === 2) {
    end = start
  }
  inputElement.selectionStart = start
  inputElement.selectionEnd = end
}

export class FormulaPopover {
  constructor (inputElement, wrapperElement, options, onChangeCallback) {
    this.inputElement = inputElement
    this.options = options

    this.previousValue = ''
    this.wrapper = wrapperElement
    if (options.id) {
      this.wrapper.setAttribute('kb-id', options.id)
    }
    if (onChangeCallback !== undefined) {
      this.onChangeCallback = onChangeCallback
    } else {
      this.onChangeCallback = function () { }
    }
    this.wrapper.style.display = 'none'
    this.inputElement.addEventListener('focus', this.onFocus.bind(this))
    this.inputElement.addEventListener('blur', this.onBlur.bind(this))
    this.inputElement.addEventListener('input', this.tidy.bind(this))
    this.inputElement.addEventListener('keydown', this.onKeyDown.bind(this))
    this.setContent()
  }

  /**
      Adds buttons to allow insertion of characters from this.options.characters in this.inputElement
    */
  setContent () {
    // Clear content
    this.wrapper.innerHTML = ''
    // Input buttons
    for (const i in this.options.characters) {
      if (this.options.characters[i].hideButton) {
        continue
      }
      const button = document.createElement('button')
      button.type = 'button'
      if (this.options.characters[i].latex) {
        button.innerHTML = katex.renderToString(this.options.characters[i].latex, {
          throwOnError: false
        })
      } else {
        button.innerHTML = this.options.characters[i].charStyled || this.options.characters[i].char
      }
      button.setAttribute('char', this.options.characters[i].char)
      button.classList = 'btn btn-sm btn-outline-secondary'
      this.wrapper.appendChild(button)
      button.addEventListener('mousedown', this.addText.bind(this))
    }
    // Undo button
    if (this.options.allowUndo) {
      const unButton = document.createElement('button')
      unButton.type = 'button'
      unButton.innerHTML = '&#9100;'
      unButton.classList = 'btn btn-sm btn-outline-secondary'

      this.wrapper.appendChild(unButton)
      unButton.addEventListener('mousedown', function () {
        this.undo()
        // Keep focus on inputElement after pressing button
        window.setTimeout(() => {
          this.inputElement.focus()
        }, 1)
      }.bind(this))
    }

    // Backspace button
    const bsButton = document.createElement('button')
    bsButton.type = 'button'
    bsButton.innerHTML = '⌫' // <i class="fas fa-backspace"></i>'
    bsButton.classList = 'btn btn-sm btn-outline-secondary'

    this.wrapper.appendChild(bsButton)
    bsButton.addEventListener('mousedown', function () {
      this.remove('backspace')
      // Keep focus on inputElement after pressing button
      window.setTimeout(() => {
        this.inputElement.focus()
      }, 1)
    }.bind(this))
  }

  /**
    Resets the input field to value stored in previousValue
    */
  undo () {
    this.setText(this.previousValue)
    this.onChangeCallback()
  }

  /**
      Event for clicking on button to insert text
      @param e - event from button
    */
  addText (e) {
    this.insertText(e.currentTarget.getAttribute('char'))
    const def = this._findCharDefinition(e.currentTarget.getAttribute('char'))
    if (def.function) {
      this.insertText('()')
      this.inputElement.selectionStart -= 1
      this.inputElement.selectionEnd = this.inputElement.selectionStart
    }
    this.onChangeCallback()
    // Keep focus on inputElement after pressing button
    window.setTimeout(() => {
      this.inputElement.focus()
    }, 1)
  }

  /**
      Resets the input field to the given text
    */
  setText (text) {
    this.inputElement.value = text
    this.tidy()
    this.onChangeCallback()
  }

  /**
      Handles the key press event.
      @name FormulaPopover#onKeyPress
      @param e - The event
  */
  onKeyDown (e) {
    if (e.keyCode === 8) { // backspace
      this.remove('backspace')
    } else if (e.keyCode >= 35 && e.keyCode <= 40) { // end, home, arrows
      return
    } else if (e.ctrlKey || e.metaKey || e.altKey) { // ctrl- / cmd- / alt-
      // allow default action
      return
    } else if (e.key === 'Enter' || e.key === 'Tab') {
      return
    } else if (e.keyCode === 46) { // delete
      const curs = this.inputElement.selectionStart
      const cure = this.inputElement.selectionEnd
      if (curs !== cure) {
        this.remove('delete')
      } else if (cure < this.inputElement.value.length) {
        this.remove('delete')
      }
    } else {
      const code = e.charCode || e.keyCode // FireFox Browser Support
      let char = ''
      let repkey = ''

      if (e.key) {
        char = e.key
      } else {
        char = String.fromCharCode(code)
      }

      const chars = this.options.characters
      for (const i in chars) {
        if (chars[i].char === char) {
          repkey = chars[i].char
          break
        }
        if (chars[i].triggers) {
          for (const j in chars[i].triggers) {
            if (chars[i].triggers[j] === char) {
              repkey = chars[i].char
              break
            }
          }
        }
      }
      if (repkey !== '') {
        this.insertText(repkey)
      }
    }
    e.preventDefault()
    this.onChangeCallback()
  }

  onFocus (e) {
    this.wrapper.style.display = ''
  }

  onBlur (e) {
    this.wrapper.style.display = 'none'
  }

  /**
      Inserts the string at the cursor in inputElement
      @param text - The string to be inserted
    */
  insertText (text) {
    if (document.selection) {
      // IE support
      const sel = document.selection.createRange()
      sel.text = text
    } else if (this.inputElement.selectionStart || this.inputElement.selectionStart === 0) {
      // MOZILLA/NETSCAPE support
      const startPos = this.inputElement.selectionStart
      const endPos = this.inputElement.selectionEnd
      const scrollTop = this.inputElement.scrollTop
      this.inputElement.value = this.inputElement.value.substring(0, startPos) + text + this.inputElement.value.substring(endPos, this.inputElement.value.length)
      setCursor(this.inputElement, startPos + text.length)
      this.inputElement.scrollTop = scrollTop
    } else {
      this.inputElement.value += text
    }
    this.tidy()
  }

  /**
      Removes an inserted character from the textbox.
      @name FormulaPopover#remove
      @param {String} dir - The direction (backspace | delete)
  */
  remove (dir) {
    const start = this.inputElement.selectionStart
    const end = this.inputElement.selectionEnd
    const text = this.inputElement.value

    let front = text.substring(0, start)
    let back = text.substring(end, text.length)
    if (start !== end) {
      this.inputElement.value = front + back
      setCursor(this.inputElement, start)
    } else if ((start > 0) && dir === 'backspace') {
      front = text.substring(0, start - 1)
      this.inputElement.value = front + back
      setCursor(this.inputElement, start - 1)
      if (text.substring(start - 1, start) === ' ') {
        this.remove('backspace') // als spatie verwijderd, verwijder dan ook vorige char
      }
    } else if ((end < text.length) && dir === 'delete') {
      back = text.substring(end + 1, text.length)
      this.inputElement.value = front + back
      setCursor(this.inputElement, start)
      if (text.substring(start, start + 1) === ' ') {
        this.remove('delete') // als spatie verwijderd, verwijder dan ook volgende char
      }
    }
    this.tidy()
    this.onChangeCallback()
  }

  /**
      Removes characters not present in this.options.characters and adds spaces specified in the formatting of
      this.options.characters
    */
  tidy () {
    const cs = this.inputElement.selectionStart
    const text = this.inputElement.value
    const front = text.substring(0, cs)
    let back = text.substring(cs, text.length)

    const front2 = this._doTidy(front)
    back = this._doTidy(back)

    const offset = front2.length - front.length
    this.inputElement.value = front2 + back
    setCursor(this.inputElement, cs + offset)
  }

  _doTidy (s) {
    let result = ''
    for (const i in s) {
      let c = s.charAt(i)
      const def = this._findCharDefinition(c)
      if (def) {
        c = def.char
        if (def.spaces === 'lr') {
          c = ' ' + c + ' '
        }
        if (def.spaces === 'l') {
          c = ' ' + c
        }
        if (def.spaces === 'r') {
          c = c + ' '
        }
        result += c
      }
    }
    return result
  }

  _findCharDefinition (c) {
    for (const item of this.options.characters) {
      if (item.char === c) {
        return item
      }
    }
  }
}
