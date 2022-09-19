import FormView from 'ampersand-form-view'
import bootbox from 'bootbox'
import './styles.less'

export default FormView.extend({
  initialize: function (options) {
    FormView.prototype.initialize.apply(this, arguments)

    this.onDrop = this.onDrop.bind(this)
    this.onDragOver = this.onDragOver.bind(this)
    this.onDragLeave = this.onDragLeave.bind(this)
    this.onDragEnter = this.onDragEnter.bind(this)
  },
  render () {
    FormView.prototype.render.apply(this, arguments)

    this.dropOverlay = document.createElement('div')
    this.dropOverlay.className = 'drop-overlay'
    document.body.appendChild(this.dropOverlay)

    this.addListeners()

    this.el.setAttribute('data-component', 'dropable-form')
  },
  remove () {
    FormView.prototype.remove.apply(this, arguments)

    if (this.dropOverlay && this.dropOverlay.parentNode) {
      this.dropOverlay.parentNode.removeChild(this.dropOverlay)
    }

    this.removeListeners()
  },
  onDrop (event) {
    event.preventDefault()
    event.stopPropagation()
    this.dropOverlay.style['display'] = 'none'
    this.dropOverlay.style['background-color'] = 'rgba(0,0,0,0)'

    var file = event.dataTransfer.files[0]
    this.processFile(file)
  },
  onDragOver (event) {
    event.preventDefault()
  },
  onDragLeave (event) {
    event.preventDefault()
    event.stopPropagation()
    this.dropOverlay.style['display'] = 'none'
    this.dropOverlay.style['background-color'] = 'rgba(0,0,0,0)'
  },
  onDragEnter (event) {
    event.preventDefault()
    event.stopPropagation()
    this.dropOverlay.style['display'] = 'block'
    this.dropOverlay.style['background-color'] = 'rgba(0,0,0,0.5)'
  },
  addListeners () {
    this.dropOverlay.addEventListener('drop', this.onDrop, false)
    this.dropOverlay.addEventListener('dragover', this.onDragOver, false)
    this.dropOverlay.addEventListener('dragleave', this.onDragLeave, false)
    this.el.addEventListener('dragenter', this.onDragEnter, false)
  },
  removeListeners () {
    this.dropOverlay.removeEventListener('drop', this.onDrop, false)
    this.dropOverlay.removeEventListener('dragover', this.onDragOver, false)
    this.dropOverlay.removeEventListener('dragleave', this.onDragLeave, false)
    this.el.removeEventListener('dragenter', this.onDragEnter, false)
  },
  processFile (file) {
    if (file && /json\/*/.test(file.type) === true) {
      try {
        let self = this
        var reader = new window.FileReader()
        reader.onloadend = function () {
          let data = JSON.parse(this.result)
          self.fillForm(data)
        }

        reader.readAsText(file)
      } catch (e) {
        bootbox.alert('Error reading File.')
      }
    } else {
      bootbox.alert('File not supported, please select a JSON file.')
    }
  },
  fillForm (data) {
    Object
      .keys(this._fieldViews)
      .forEach(prop => {
        let value
        try {
          value = JSON.parse(data[prop])
        } catch (err) {
          value = data[prop]
        }
        this._fieldViews[prop].setValue(value)
      })
  },
  getInvalidFields () {
    const fields = this._fieldViewsArray.filter(f => !f.valid)
    let firstInvalid
    if (Array.isArray(this.advancedFields)) {
      if (fields.find(field => this.advancedFields.includes(field.name))) {
        this.toggleAdvancedFields(true)
      }
    }
    return fields
  },
  toggleAdvancedFields (unfold = null) {
    if (unfold === true) {
      if (!this.advancedToggle) {
        return
      }
      if (this.advancedToggle.folded === false) {
        // do nothing
        return
      }
    }
    this.advancedToggle.click()
  },
})
