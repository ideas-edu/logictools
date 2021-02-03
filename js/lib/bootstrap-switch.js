/*! ============================================================
 * bootstrapSwitch v1.8 by Larentis Mattia @SpiritualGuru
 * http://www.larentis.eu/
 *
 * Enhanced for radiobuttons by Stein, Peter @BdMdesigN
 * http://www.bdmdesign.org/
 *
 * Project site:
 * http://www.larentis.eu/switch/
 * ============================================================
 * Licensed under the Apache License, Version 2.0
 * http://www.apache.org/licenses/LICENSE-2.0
 * ============================================================ */

!(function ($) {
  'use strict'

  $.fn.bootstrapSwitch = function (method) {
    const inputSelector = 'input[type!="hidden"]'
    const methods = {
      init: function () {
        return this.each(function () {
          const $element = $(this)
          let $div
          let $switchLeft
          let $switchRight
          let $label
          const $form = $element.closest('form')
          let myClasses = ''
          const classes = $element.attr('class')
          let color
          let moving
          let onLabel = 'ON'
          let offLabel = 'OFF'
          let icon = false
          let textLabel = false

          $.each(['switch-mini', 'switch-small', 'switch-large'], function (i, el) {
            if (classes.indexOf(el) >= 0) {
              myClasses = el
            }
          })

          $element.addClass('has-switch')

          if ($element.data('on') !== undefined) {
            color = 'switch-' + $element.data('on')
          }

          if ($element.data('on-label') !== undefined) {
            onLabel = $element.data('on-label')
          }

          if ($element.data('off-label') !== undefined) {
            offLabel = $element.data('off-label')
          }

          if ($element.data('label-icon') !== undefined) {
            icon = $element.data('label-icon')
          }

          if ($element.data('text-label') !== undefined) {
            textLabel = $element.data('text-label')
          }

          $switchLeft = $('<span>')
            .addClass('switch-left')
            .addClass(myClasses)
            .addClass(color)
            .html('' + onLabel + '')

          color = ''
          if ($element.data('off') !== undefined) {
            color = 'switch-' + $element.data('off')
          }

          $switchRight = $('<span>')
            .addClass('switch-right')
            .addClass(myClasses)
            .addClass(color)
            .html('' + offLabel + '')

          $label = $('<label>')
            .html('&nbsp;')
            .addClass(myClasses)
            .attr('for', $element.find(inputSelector).attr('id'))

          if (icon) {
            $label.html('<i class="icon ' + icon + '"></i>')
          }

          if (textLabel) {
            $label.html('' + textLabel + '')
          }

          $div = $element.find(inputSelector).wrap($('<div>')).parent().data('animated', false)

          if ($element.data('animated') !== false) {
            $div.addClass('switch-animate').data('animated', true)
          }

          $div
            .append($switchLeft)
            .append($label)
            .append($switchRight)

          $element.find('>div').addClass(
            $element.find(inputSelector).is(':checked') ? 'switch-on' : 'switch-off'
          )

          if ($element.find(inputSelector).is(':disabled')) {
            $(this).addClass('deactivate')
          }

          const changeStatus = function ($this) {
            if ($element.parent('label').is('.label-change-switch')) {

            } else {
              $this.siblings('label').trigger('mousedown').trigger('mouseup').trigger('click')
            }
          }

          $element.on('keydown', function (e) {
            if (e.keyCode === 32) {
              e.stopImmediatePropagation()
              e.preventDefault()
              changeStatus($(e.target).find('span:first'))
            }
          })

          $switchLeft.on('click', function (e) {
            changeStatus($(this))
          })

          $switchRight.on('click', function (e) {
            changeStatus($(this))
          })

          $element.find(inputSelector).on('change', function (e, skipOnChange) {
            const $this = $(this)
            const $element = $this.parent()
            const thisState = $this.is(':checked')
            const state = $element.is('.switch-off')

            e.preventDefault()

            $element.css('left', '')

            if (state === thisState) {
              if (thisState) {
                $element.removeClass('switch-off').addClass('switch-on')
              } else {
                $element.removeClass('switch-on').addClass('switch-off')
              }

              if ($element.data('animated') !== false) {
                $element.addClass('switch-animate')
              }

              if (typeof skipOnChange === 'boolean' && skipOnChange) {
                return
              }

              $element.parent().trigger('switch-change', { el: $this, value: thisState })
            }
          })

          $element.find('label').on('mousedown touchstart', function (e) {
            const $this = $(this)
            moving = false

            e.preventDefault()
            e.stopImmediatePropagation()

            $this.closest('div').removeClass('switch-animate')

            if ($this.closest('.has-switch').is('.deactivate')) {
              $this.unbind('click')
            } else if ($this.closest('.switch-on').parent().is('.radio-no-uncheck')) {
              $this.unbind('click')
            } else {
              $this.on('mousemove touchmove', function (e) {
                const $element = $(this).closest('.make-switch')
                const relativeX = (e.pageX || e.originalEvent.targetTouches[0].pageX) - $element.offset().left
                let percent = (relativeX / $element.width()) * 100
                const left = 25
                const right = 75

                moving = true

                if (percent < left) {
                  percent = left
                } else if (percent > right) {
                  percent = right
                }

                $element.find('>div').css('left', (percent - right) + '%')
              })

              $this.on('click touchend', function (e) {
                const $this = $(this)
                const $myInputBox = $this.siblings('input')

                e.stopImmediatePropagation()
                e.preventDefault()

                $this.unbind('mouseleave')

                if (moving) {
                  $myInputBox.prop('checked', !(parseInt($this.parent().css('left')) < -25))
                } else {
                  $myInputBox.prop('checked', !$myInputBox.is(':checked'))
                }

                moving = false
                $myInputBox.trigger('change')
              })

              $this.on('mouseleave', function (e) {
                const $this = $(this)
                const $myInputBox = $this.siblings('input')

                e.preventDefault()
                e.stopImmediatePropagation()

                $this.unbind('mouseleave mousemove')
                $this.trigger('mouseup')

                $myInputBox.prop('checked', !(parseInt($this.parent().css('left')) < -25)).trigger('change')
              })

              $this.on('mouseup', function (e) {
                e.stopImmediatePropagation()
                e.preventDefault()

                $(this).trigger('mouseleave')
              })
            }
          })

          if ($form.data('bootstrapSwitch') !== 'injected') {
            $form.bind('reset', function () {
              setTimeout(function () {
                $form.find('.make-switch').each(function () {
                  const $input = $(this).find(inputSelector)

                  $input.prop('checked', $input.is(':checked')).trigger('change')
                })
              }, 1)
            })
            $form.data('bootstrapSwitch', 'injected')
          }
        }
        )
      },
      toggleActivation: function () {
        const $this = $(this)

        $this.toggleClass('deactivate')
        $this.find(inputSelector).prop('disabled', $this.is('.deactivate'))
      },
      isActive: function () {
        return !$(this).hasClass('deactivate')
      },
      setActive: function (active) {
        const $this = $(this)

        if (active) {
          $this.removeClass('deactivate')
          $this.find(inputSelector).removeAttr('disabled')
        } else {
          $this.addClass('deactivate')
          $this.find(inputSelector).attr('disabled', 'disabled')
        }
      },
      toggleState: function (skipOnChange) {
        const $input = $(this).find(':checkbox')
        $input.prop('checked', !$input.is(':checked')).trigger('change', skipOnChange)
      },
      toggleRadioState: function (skipOnChange) {
        const $radioinput = $(this).find(':radio')
        $radioinput.not(':checked').prop('checked', !$radioinput.is(':checked')).trigger('change', skipOnChange)
      },
      toggleRadioStateAllowUncheck: function (uncheck, skipOnChange) {
        const $radioinput = $(this).find(':radio')
        if (uncheck) {
          $radioinput.not(':checked').trigger('change', skipOnChange)
        } else {
          $radioinput.not(':checked').prop('checked', !$radioinput.is(':checked')).trigger('change', skipOnChange)
        }
      },
      setState: function (value, skipOnChange) {
        $(this).find(inputSelector).prop('checked', value).trigger('change', skipOnChange)
      },
      setOnLabel: function (value) {
        const $switchLeft = $(this).find('.switch-left')
        $switchLeft.html(value)
      },
      setOffLabel: function (value) {
        const $switchRight = $(this).find('.switch-right')
        $switchRight.html(value)
      },
      setOnClass: function (value) {
        const $switchLeft = $(this).find('.switch-left')
        let color = ''
        if (value !== undefined) {
          if ($(this).attr('data-on') !== undefined) {
            color = 'switch-' + $(this).attr('data-on')
          }
          $switchLeft.removeClass(color)
          color = 'switch-' + value
          $switchLeft.addClass(color)
        }
      },
      setOffClass: function (value) {
        const $switchRight = $(this).find('.switch-right')
        let color = ''
        if (value !== undefined) {
          if ($(this).attr('data-off') !== undefined) {
            color = 'switch-' + $(this).attr('data-off')
          }
          $switchRight.removeClass(color)
          color = 'switch-' + value
          $switchRight.addClass(color)
        }
      },
      setAnimated: function (value) {
        const $element = $(this).find(inputSelector).parent()
        if (value === undefined) {
          value = false
        }
        $element.data('animated', value)
        $element.attr('data-animated', value)

        if ($element.data('animated') !== false) {
          $element.addClass('switch-animate')
        } else {
          $element.removeClass('switch-animate')
        }
      },
      setSizeClass: function (value) {
        const $element = $(this)
        const $switchLeft = $element.find('.switch-left')
        const $switchRight = $element.find('.switch-right')
        const $label = $element.find('label')
        $.each(['switch-mini', 'switch-small', 'switch-large'], function (i, el) {
          if (el !== value) {
            $switchLeft.removeClass(el)
            $switchRight.removeClass(el)
            $label.removeClass(el)
          } else {
            $switchLeft.addClass(el)
            $switchRight.addClass(el)
            $label.addClass(el)
          }
        })
      },
      status: function () {
        return $(this).find(inputSelector).is(':checked')
      },
      destroy: function () {
        const $element = $(this)
        const $div = $element.find('div')
        const $form = $element.closest('form')
        let $inputbox

        $div.find(':not(input)').remove()

        $inputbox = $div.children()
        $inputbox.unwrap().unwrap()

        $inputbox.unbind('change')

        if ($form) {
          $form.unbind('reset')
          $form.removeData('bootstrapSwitch')
        }

        return $inputbox
      }
    }

    if (methods[method]) {
      return methods[method].apply(this, Array.prototype.slice.call(arguments, 1))
    } else if (typeof method === 'object' || !method) {
      return methods.init.apply(this, arguments)
    } else {
      $.error('Method ' + method + ' does not exist!')
    }
  }
})(jQuery);

(function ($) {
  $(function () {
    $('.make-switch').bootstrapSwitch()
  })
})(jQuery)
