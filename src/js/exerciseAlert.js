import { translate } from './translate.js'

export class ExerciseAlert {
  constructor (id) {
    this.id = id
    this.buttonCallback = undefined
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
    document.getElementById(`${this.id}-span`).setAttribute('translate-key', alertKey)
    document.getElementById(`${this.id}-span`).setAttribute('translate-params', JSON.stringify(alertParams))
    document.getElementById(`${this.id}-span`).innerHTML = translate(alertKey, alertParams)

    const alertButton = document.getElementById(`${this.id}-button`)
    if (buttonKey !== undefined) {
      document.getElementById(`${this.id}-button`).setAttribute('translate-key', buttonKey)
      alertButton.innerHTML = translate(buttonKey)
      this.buttonCallback = buttonCallback
      alertButton.style.display = ''
    } else {
      this.buttonCallback = undefined
      alertButton.style.display = 'none'
    }
  }
}
