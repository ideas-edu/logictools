import { translate } from './translate.js'

export class ExerciseAlert {
  constructor (id) {
    this.id = id
    this.alertKey = null
    this.alertParams = null
    this.buttonKey = null
    this.buttonCallback = undefined
  }

  updateTexts () {
    if (this.alertKey !== null) {
      document.getElementById(`${this.id}-span`).innerHTML = translate(this.alertKey, this.alertParams)
      if (this.buttonKey !== undefined) {
        document.getElementById(`${this.id}-button`).innerHTML = translate(this.buttonKey)
      }
    }
  }

  // Updates the alert which gives user feedback with the translate string found for given key and styled based on the type of alert.
  // We use keys and params here so that they are updated when switching language
  updateAlert (alertKey, alertParams, type, buttonKey, buttonCallback) {
    document.getElementById(`${this.id}-container`).style.display = ''
    switch (type) {
      case 'hint':
        document.getElementById(`${this.id}-icon`).innerHTML = '<i class="fas fa-lg fa-info-circle"></i>'
        document.getElementById(`${this.id}`).classList = 'alert col-md-12 hint-alert'
        break
      case 'error':
        document.getElementById(`${this.id}-icon`).innerHTML = '<i class="fas fa-lg fa-exclamation-circle"></i>'
        document.getElementById(`${this.id}`).classList = 'alert col-md-12 error-alert'
        break
      case 'complete':
        document.getElementById(`${this.id}-icon`).innerHTML = '<i class="fas fa-lg fa-check-circle"></i>'
        document.getElementById(`${this.id}`).classList = 'alert col-md-12 complete-alert'
        break
    }
    this.alertKey = alertKey
    this.alertParams = alertParams
    this.buttonKey = buttonKey

    const alertButton = document.getElementById(`${this.id}-button`)
    if (buttonKey !== undefined) {
      alertButton.innerHTML = translate(buttonKey)
      this.buttonCallback = buttonCallback
      alertButton.style.display = ''
    } else {
      this.buttonCallback = undefined
      alertButton.style.display = 'none'
    }
    document.getElementById(`${this.id}-span`).innerHTML = translate(alertKey, alertParams)
  }
}
