import jsrender from 'jsrender'
import Modal from 'bootstrap/js/dist/modal'

const $ = jsrender(null)

export class SurveyModalController {
  constructor (survey) {
    this.survey = survey
  }

  /**
   * Show the modal
   * @param {String} which The template to show
   * @param {String} where The id of the element to load the modal in
   */
  show (which, where) {
    const tmpl = $.templates('#' + which)
    const html = tmpl.render(this.survey)
    document.getElementById(where).innerHTML += html

    this.modal = new Modal(
      document.getElementById('survey-modal'),
      { backdrop: true, focus: true, keyboard: true }
    )

    this.initializeBehaviour()
    this.modal.show()
  }

  close () {
    const modalElement = document.querySelector('iframe #survey-modal')
    const modal = Modal.getOrCreateInstance(modalElement)
    modal.dispose()
  }

  initializeBehaviour () {
    document
      .getElementById('close-modal-btn')
      .addEventListener('click', (event) => { this.close() })

    document
      .getElementById('dismiss-modal-btn')
      .addEventListener('click', (event) => { this.close() })

    document
      .getElementById('ok-modal-btn')
      .addEventListener('click', (event) => {
        this.logFeedback()
        this.close()
      })
  }

  logFeedback () {
    console.log('Feedback!')
  }
}
