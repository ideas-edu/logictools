import $ from 'jquery'
import 'bootstrap'
import { iframeResize } from 'iframe-resizer'
import 'bootstrap/dist/css/bootstrap.min.css'
import '@fortawesome/fontawesome-free/js/fontawesome'
import '@fortawesome/fontawesome-free/js/solid'
import '@fortawesome/fontawesome-free/js/regular'
import '@fortawesome/fontawesome-free/js/brands'

import { LogEXSession } from './logEXSession.js'
import { Resources } from './resources.js'

(function () {
  $(document).ready(function () {
    const mainFrameController = new MainFrameController()
    let paneID
    let src

    mainFrameController.initializeLanguage()
    mainFrameController.initializeLabels()

    // Make sure tabs are only loaded when they are clicked for the first time.
    $('#myTabs').on('shown.bs.tab', function (e) {
      paneID = $(e.target).attr('href')
      src = $(paneID).attr('data-src')

      // if the iframe hasnt already been loaded: load it once
      if ($(paneID + ' iframe').attr('src') === '') {
        $(paneID + ' iframe').attr('src', src)
      }
    })

    iframeResize({
      log: false,
      contentWindowBodyMargin: 8,
      doHeight: true,
      doWidth: false,
      interval: 250
    }, 'iframe')
  })
})()

export function MainFrameController () {
  const self = this

  /**
        Initializes the language to the user settings or falls back to the browser language.
     */
  this.initializeLanguage = function () {
    let language,
      browserLanguage
    if (LogEXSession.getLanguage() === null) {
      // Default language = EN overrule with browser language
      language = 'EN'
      browserLanguage = window.navigator.userLanguage || window.navigator.language
      if (browserLanguage.substring(0, 2) === 'nl') {
        language = 'NL'
      }
      LogEXSession.setLanguage(language)
    }
    const buttonId = '#button-' + LogEXSession.getLanguage()
    $(buttonId).addClass('active')
  }

  /**
        Initializes all buttons and label to correct language
     */
  this.initializeLabels = function () {
    const language = LogEXSession.getLanguage()

    $('#button-' + language).addClass('active')

    $('#exercisetype').html(Resources.getText(language, 'extype'))
    $('#tab-logeq').html(Resources.getText(language, 'exlogeq'))
    $('#tab-dnv').html(Resources.getText(language, 'exdnv'))
    $('#tab-cnv').html(Resources.getText(language, 'excnv'))
    $('#help').html("<i class='fas fa-question-circle'></i> " + Resources.getText(language, 'help'))
    $('#help').attr('href', 'LogEX_manual_' + language + '.pdf').attr('target', '_new')
  }

  $('#lang-NL').click(function () {
    LogEXSession.setLanguage('NL')
    self.initializeLabels()

    // All iFrames must be updated to Dutch
    if ($('#fraLogEQ').attr('src') !== '') {
      $('#fraLogEQ')[0].contentWindow.UITranslator.translate('LOGEQ')
    }
    if ($('#fraDNV').attr('src') !== '') {
      $('#fraDNV')[0].contentWindow.UITranslator.translate('DNV')
    }
    if ($('#fraCNV').attr('src') !== '') {
      $('#fraCNV')[0].contentWindow.UITranslator.translate('CNV')
    }

    // Switch view of the buttons (Bold = Active)
    $('#button-NL').addClass('active')
    $('#button-EN').removeClass('active')
  })

  $('#lang-EN').click(function () {
    LogEXSession.setLanguage('EN')
    self.initializeLabels()

    // All iFrames must be updated to English.
    if ($('#fraLogEQ').attr('src') !== '') {
      $('#fraLogEQ')[0].contentWindow.UITranslator.translate('LOGEQ')
    }
    if ($('#fraDNV').attr('src') !== '') {
      $('#fraDNV')[0].contentWindow.UITranslator.translate('DNV')
    }
    if ($('#fraCNV').attr('src') !== '') {
      $('#fraCNV')[0].contentWindow.UITranslator.translate('CNV')
    }

    // Switch view of the buttons (Bold = Active)
    $('#button-EN').addClass('active')
    $('#button-NL').removeClass('active')
  })

  // doh: helaas is er een tweede set van gelijke eventhandlers nodig voor de taalknoppen in het hoofdvenster

  $('#lang2-NL').click(function () {
    LogEXSession.setLanguage('NL')
    self.initializeLabels()

    // All iFrames must be updated to Dutch
    if ($('#fraLogEQ').attr('src') !== '') {
      $('#fraLogEQ')[0].contentWindow.UITranslator.translate('LOGEQ')
    }
    if ($('#fraDNV').attr('src') !== '') {
      $('#fraDNV')[0].contentWindow.UITranslator.translate('DNV')
    }
    if ($('#fraCNV').attr('src') !== '') {
      $('#fraCNV')[0].contentWindow.UITranslator.translate('CNV')
    }

    // Switch view of the buttons (Bold = Active)
    $('#lang2-NL').addClass('active')
    $('#lang2-EN').removeClass('active')
  })

  $('#lang2-EN').click(function () {
    LogEXSession.setLanguage('EN')
    self.initializeLabels()

    // All iFrames must be updated to English.
    if ($('#fraLogEQ').attr('src') !== '') {
      $('#fraLogEQ')[0].contentWindow.UITranslator.translate('LOGEQ')
    }
    if ($('#fraDNV').attr('src') !== '') {
      $('#fraDNV')[0].contentWindow.UITranslator.translate('DNV')
    }
    if ($('#fraCNV').attr('src') !== '') {
      $('#fraCNV')[0].contentWindow.UITranslator.translate('CNV')
    }

    // Switch view of the buttons (Bold = Active)
    $('#lang2-EN').addClass('active')
    $('#lang2-NL').removeClass('active')
  })
}
