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
  constructor (inputElement, wrapperElement, options) {
    this.inputElement = inputElement
    this.options = options

    this.previousValue = ''
    this.wrapper = wrapperElement
    if (options.id) {
      this.wrapper.setAttribute('id', options.id)
    }
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
    // Input buttons
    for (const i in this.options.characters) {
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
        this.inputElement.value = this.previousValue
        this.tidy()
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
      Event for clicking on button to insert text
      @param e - event from button
    */
  addText (e) {
    this.insertText(e.currentTarget.getAttribute('char'))
    // Keep focus on inputElement after pressing button
    window.setTimeout(() => {
      this.inputElement.focus()
    }, 1)
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
        if (def.spaces) {
          c = ' ' + c + ' '
        }
        result += c
      }
    }
    return result
  }

  _findCharDefinition (c) {
    for (const i in this.options.characters) {
      const item = this.options.characters[i]
      if (item.char === c) {
        return item
      }
    }
  }
}

// console.log(FormulaPopover)

// let guid = 1

// function caret (el, start, end) {
//   if (arguments.length === 2) {
//     end = start
//   }
//   el = $(el)[0]
//   el.selectionStart = start
//   el.selectionEnd = end
// }

/* FormulaPopover PUBLIC CLASS DEFINITION
   * =============================== */
// const FormulaPopover = function (element, options) {
//   this.init(element, options)
//   this.previousValue = ''
// }

// /* NOTE: FormulaPopover EXTENDS BOOTSTRAP-TOOLTIP.js
//    ========================================== */

// /**
//       FormulaPopover is a jQuery plugin that provides a simple formula editor for a textbox.
//       @constructor
//       @name FormulaPopover
//       @param element - The DOM element (textbox)
//       @param options - The options
//   */

// const _super = $.fn.tooltip.Constructor.prototype
// FormulaPopover.prototype = $.extend({}, _super, {

//   constructor: FormulaPopover,

//   init: function (element, options) {
//     this.$element = $(element)
//     this.options = options
//     const id = 'kbiput-tip-wrapper-' + (guid++)
//     if (!options) {
//       options = {}
//     }
//     options.container = '#' + id

//     this.$wrapper = $('<div class="kbinput-tip-wrapper"></div>').attr('id', id)
//       .insertAfter(this.$element)
//       .on('click', '[data-action=insert]', $.proxy(this.onInsert, this))
//       .on('click', '[data-action=undo]', $.proxy(this.undo, this))
//       .on('click', '[data-action=backspace]', $.proxy(function () {
//         this.remove('backspace')
//       }, this))
//       .on('blur', 'a', $.proxy(this.onBlur, this))
//     console.log(_super)
//     // _super.apply(this, ['ideas.kbinput', element, options])
//     if (typeof this.options.chars === 'string') {
//       this.options.chars = $.fn.kbinput.presets[this.options.chars]
//     }
//     this.$element
//       .on('keydown.ideas.kbinput', this.options.selector, $.proxy(this.onKeyDown, this))
//       .on('focus.ideas.kbinput', this.options.selector, $.proxy(this.onFocus, this))
//       .on('blur.ideas.kbinput', this.options.selector, $.proxy(this.onBlur, this))
//   },

//   onFocus: function (e) {
//     // this.show()
//   },

//   onBlur: function (e) {
//     const relatedTarget = e.relatedTarget ||
//                   e.explicitOriginalTarget ||
//                   document.activeElement // IE11

//     if (relatedTarget) {
//       if (this.$tip && this.$tip.has(relatedTarget).length) {
//         return
//       }
//       if (relatedTarget === this.$element[0]) {
//         return
//       }
//     }
//     // this.hide()
//   },

//   /**
//           Sets the content of the popover.
//           @name FormulaPopover#setContent
//       */
//   setContent: function () {
//     const $tip = this.tip()
//     const title = this.getTitle()
//     const content = this.getContent()

//     $tip.find('.kbinput-popover-title')[this.options.html ? 'html' : 'text'](title)
//     $tip.find('.kbinput-popover-content')[this.options.html ? 'html' : 'text'](content)

//     $tip.removeClass('fade top bottom left right in')
//   },

//   /**
//           Checks if the popover has content.
//           @name FormulaPopover#hasContent
//           @returns {Boolean} - true if the popover has content, false otherwise
//       */
//   hasContent: function () {
//     return this.getTitle() || this.getContent()
//   },

//   /**
//           Gets the popover content.
//           @name FormulaPopover#getContent
//           @returns {String} - the content of the popover
//       */
//   getContent: function () {
//     const targetId = this.$element.attr('id')
//     let content = '<div class="navbar navbar-default" id="' + targetId + '-popover"><div class="navbar-inner"><ul class="nav navbar-nav">'

//     content += ($.map(this.options.chars, function (value) {
//       return '<li><a href="#" class="spaced" data-action="insert" tabindex="0" data-char="' + value.char + '">' +
//                      value.char + '</a></li>'
//     })).join('')

//     content += "</ul><ul class='nav navbar-nav pull-right'>"
//     content += "<li><a href='#' data-action='undo' tabindex='0' style='padding-top:4px;font-size:9pt;'>&#x021BA;</a></li>"
//     content += "<li><a href='#' data-action='backspace' tabindex='0'><span class='backspace'></span></a></li>"
//     content += '</ul></div></div>'

//     return content
//   },

//   tip: function () {
//     if (!this.$tip) {
//       this.$tip = $(this.options.template)
//     }
//     return this.$tip
//   },

//   getDefaults: function () {
//     return $.fn.kbinput.defaults
//   },

//   /**
//           Inserts the text in the textbox.
//           @name FormulaPopover#insertText
//           @param {String} text - The text
//       */
//   insertText: function (text) {
//     if (document.selection) {
//       // IE support
//       this.$element[0].focus()
//       const sel = document.selection.createRange()
//       sel.text = text
//       this.$element[0].focus()
//     } else if (this.$element[0].selectionStart || this.$element[0].selectionStart === 0) {
//       // MOZILLA/NETSCAPE support
//       const startPos = this.$element[0].selectionStart
//       const endPos = this.$element[0].selectionEnd
//       const scrollTop = this.$element[0].scrollTop
//       this.$element[0].value = this.$element[0].value.substring(0, startPos) + text + this.$element[0].value.substring(endPos, this.$element[0].value.length)
//       this.$element[0].focus()
//       caret(this.$element, startPos + text.length)
//       this.$element[0].scrollTop = scrollTop
//     } else {
//       this.$element[0].value += text
//       this.$element[0].focus()
//     }
//     this.tidy()
//     this._triggerChange()
//   },

//   _triggerChange: function () {
//     if (this.options.onValueChanged !== undefined) {
//       this.options.onValueChanged()
//     }
//     this.$element.change()
//   },

//   onInsert: function (e) {
//     const value = $(e.target).attr('data-char')
//     this.insertText(value)
//   },

//   /**
//           Undos the last action.
//           @name FormulaPopover#undo
//       */
//   undo: function () { // undo kan geroepen worden over self of over other
//     $(this.$element[0]).val(this.previousValue)
//     $(this.$element[0]).tooltip('destroy')
//     $(this.$element[0]).popover('destroy')
//     $(this.$element[0]).removeClass('error')
//   },

//   /**
//           Sets the previous value.
//           @name FormulaPopover#setPreviousValue
//           @param {String} formula - The previous formula
//       */
//   setPreviousValue: function (formula) {
//     this.previousValue = formula
//   },

//   /**
//           Removes an inserted character from the textbox.
//           @name FormulaPopover#remove
//           @param {String} dir - The direction (backspace | delete)
//       */
//   remove: function (dir) {
//     const field = this.$element[0]
//     const start = field.selectionStart
//     const end = field.selectionEnd
//     const text = this.$element.val()

//     let front = text.substring(0, start)
//     let back = text.substring(end, text.length)
//     if (start !== end) {
//       this.$element.val(front + back)
//       caret(field, start)
//     } else if ((start > 0) && dir === 'backspace') {
//       front = text.substring(0, start - 1)
//       this.$element.val(front + back)
//       caret(field, start - 1)
//       if (text.substring(start - 1, start) === ' ') {
//         this.remove('backspace') // als spatie verwijderd, verwijder dan ook vorige char
//       }
//     } else if ((end < text.length) && dir === 'delete') {
//       back = text.substring(end + 1, text.length)
//       this.$element.val(front + back)
//       caret(field, start)
//       if (text.substring(start, start + 1) === ' ') {
//         this.remove('delete') // als spatie verwijderd, verwijder dan ook vorige char
//       }
//     }
//     this._triggerChange()
//   },

//   /**
//           Handles the key press event.
//           @name FormulaPopover#onKeyPress
//           @param e - The event
//       */
//   onKeyDown: function (e) {
//     const field = this.$element[0]
//     if (e.keyCode === 8) { // backspace
//       this.remove('backspace')
//     } else if (e.keyCode >= 35 && e.keyCode <= 40) { // end, home, arrows
//       return
//     } else if (e.ctrlKey || e.metaKey || e.altKey) { // ctrl- / cmd- / alt-
//       // allow default action
//       return
//     } else if (e.key === 'Enter' || e.key === 'Tab') {
//       return
//     } else if (e.keyCode === 46) { // delete
//       const curs = field.selectionStart
//       const cure = field.selectionEnd
//       if (curs !== cure) {
//         this.remove('delete')
//       } else if (cure < this.$element.val().length) {
//         this.remove('delete')
//       }
//     } else {
//       const code = e.charCode || e.keyCode // FireFox Browser Support
//       let char = ''
//       let repkey = ''

//       const CHARS = {
//         173: '-',
//         187: '=',
//         188: ',',
//         189: '-',
//         190: '.',
//         192: '~',
//         220: '|'
//       }
//       if (CHARS.hasOwnProperty(code)) {
//         char = CHARS[code]
//       } else if (e.key) {
//         char = e.key
//       } else {
//         char = String.fromCharCode(code).toLowerCase()
//       }

//       const chars = this.options.chars
//       for (let i = 0; i < chars.length; i++) {
//         if (chars[i].char.toLowerCase() === char) {
//           repkey = chars[i].char
//           break
//         }
//         if (chars[i].triggers) {
//           for (let j = 0; j < chars[i].triggers.length; j++) {
//             if (chars[i].triggers[j] === char) {
//               repkey = chars[i].char
//               break
//             }
//           }
//         }
//       }
//       if (repkey !== '') {
//         this.insertText(repkey)
//       }
//     }
//     e.preventDefault()
//   },

//   /**
//           Tidies the formula.
//           @name FormulaPopover#tidy
//       */
//   tidy: function () {
//     const cs = this.$element[0].selectionStart
//     const text = this.$element.val()
//     const front = text.substring(0, cs)
//     let back = text.substring(cs, text.length)

//     const front2 = this._doTidy(front)
//     back = this._doTidy(back)

//     const offset = front2.length - front.length
//     this.$element.val(front2 + back)
//     caret(this.$element, cs + offset)
//   },

//   _doTidy: function (s) {
//     let result = ''
//     for (let i = 0; i < s.length; i++) {
//       let c = s.charAt(i)
//       const def = this._findCharDefinition(c)
//       if (def) {
//         c = def.char
//         if (def.spaces) {
//           c = ' ' + c + ' '
//         }
//         result += c
//       }
//     }
//     return result
//   },

//   _findCharDefinition: function (c) {
//     for (let i = 0; i < this.options.chars.length; i++) {
//       const item = this.options.chars[i]
//       if (item.char === c) {
//         return item
//       }
//     }
//   }
// })

// /* kbinput PLUGIN DEFINITION
//    * ======================= */
// $.fn.kbinput = function (option, parameter) {
//   return this.each(function () {
//     const $this = $(this)
//     let data = $this.data('bs.ideas.kbinput')
//     let options = typeof option === 'object' && option
//     // if (typeof option === 'string') {
//     //   if ($.fn.kbinput.presets.hasOwnProperty(option)) {
//     //     options = { chars: option }
//     //     option = options
//     //   }
//     // }
//     if (!data) {
//       $this.data('bs.ideas.kbinput', (data = new FormulaPopover(this, options)))
//     }
//     if (typeof option === 'string') {
//       return data[option](parameter)
//     }
//   })
// }

// $.fn.kbinput = FormulaPopover
// console.log($.fn.kbinput)

// // we need to support Bootstrap 2.x as well here
// const baseDefaults = $.fn.tooltip.Constructor.DEFAULTS || $.fn.tooltip.defaults

// const axiomaticMin = [{
//   char: '¬',
//   triggers: ['-', 'n', '~', '1']
// }, {
//   char: '→',
//   triggers: ['i', '.'],
//   spaces: true
// },
// { char: 'p' },
// { char: 'q' },
// { char: 'r' },
// { char: 's' }, {
//   char: '(',
//   triggers: ['9']
// }, {
//   char: ')',
//   triggers: ['0']
// }]

// $.fn.kbinput.presets = {
//   numeric: (function () {
//     const result = []
//     for (let i = 0; i <= 9; i++) {
//       result.push({ char: '' + i })
//     }
//     return result
//   })(),
//   logic: [{
//     char: '¬',
//     triggers: ['-', 'n', '~', '1']
//   }, {
//     char: '∧',
//     triggers: ['a', '7', '6'],
//     spaces: true
//   }, {
//     char: '∨',
//     triggers: ['o', 'v', '|'],
//     spaces: true
//   }, {
//     char: '→',
//     triggers: ['i', '.'],
//     spaces: true
//   }, {
//     char: '↔',
//     triggers: ['=', 'e'],
//     spaces: true
//   },
//   { char: 'T' },
//   { char: 'F' },
//   { char: 'p' },
//   { char: 'q' },
//   { char: 'r' },
//   { char: 's' }, {
//     char: '(',
//     triggers: ['9']
//   }, {
//     char: ')',
//     triggers: ['0']
//   }],
//   axiomatic_min: axiomaticMin,
//   axiomatic: axiomaticMin.concat([{ char: '⊢', triggers: ['|', '3', '#'] }, { char: ',' }])
// }

// $.fn.kbinput.defaults = $.extend({}, baseDefaults, {
//   placement: 'top',
//   trigger: 'manual',
//   content: '',
//   html: true,
//   animation: false,
//   template: '<div class="kbinput-popover"><div class="kbinput-popover-inner"><div class="kbinput-popover-content"></div></div></div>',
//   chars: 'logic'
// })

// $.fn['ideas.kbinput'] = {
//   defaults: $.fn.kbinput.defaults
// }
