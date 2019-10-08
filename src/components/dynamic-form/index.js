import FIELD from 'constants/field'
import DropableForm from 'components/dropable-form'
import InputView from 'components/input-view'
import SelectView from 'components/select2-view'
import HelpIcon from 'components/help-icon'
import Datepicker from 'components/input-view/datepicker'
import OneLineMediaInputView from 'components/input-view/media/oneline'
import MediaFileModel from './media-file'
import isURL from 'validator/lib/isURL'
import config from 'config'

module.exports = DropableForm.extend({
  props: {
    fieldsDefinitions: 'array'
  },
  initialize (options) {
    const fieldsSpecs = options.fieldsDefinitions
    this.fields = []

    fieldsSpecs.forEach(spec => {
      let field = this.fieldFactory(spec)
      if (field !== null) {
        this.fields.push(field)
      }
    })

    DropableForm.prototype.initialize.apply(this,arguments)
  },
  submit (next) {
    next || (next = function(){})

    this.beforeSubmit()
    if (this.valid) {
      for (var key in this.data) {
        if (this._fieldViews[key]._values.type === 'file') {
          this.data[key].dataUrl = this._fieldViews[key]._values.file.dataUrl
        }
      }
      next(null, this.data)
    }
  },
  render () {
    DropableForm.prototype.render.apply(this, arguments)
    this.query('form').classList.add('form-horizontal')
    this.renderHelpIcons()
  },
  renderHelpIcons () {
    this.fieldsDefinitions.forEach(def => {
      if (def.help) {
        const view = this._fieldViews[def.order.toString()]
        if (!view) return
        view.renderSubview(
          new HelpIcon({
            text: def.help
          }),
          view.query('label')
        )
      }
    })
  },
  fieldFactory (spec) {
    let field = null
    switch (spec.type) {
      case FIELD.TYPE_INPUT:
        field = this.buildTextField(spec)
        break
      case FIELD.TYPE_SELECT:
        field = this.buildOptionsField(spec)
        break
      case FIELD.TYPE_DATE:
        field = this.buildDateField(spec)
        break
      case FIELD.TYPE_FILE:
        field = this.buildFileField(spec)
        break
      case FIELD.TYPE_REMOTE_OPTIONS:
        field = this.buildRemoteOptionsField(spec)
        break
    }
    return field
  },
  buildTextField (spec) {
    return new InputView({
      label: spec.label,
      name: spec.order.toString(),
      required: spec.required,
      invalidClass: 'text-danger',
      validityClassSelector: '.control-label',
      value: spec.value,
      type: spec.masked ? 'password' : 'text'
    })
  },
  buildDateField (spec) {
    return new Datepicker({
      label: spec.label,
      name: spec.order.toString(),
      required: spec.required,
      enableTime: true,
      dateFormat: 'F J, Y at H:i',
      value: spec.value,
      invalidClass: 'text-danger',
      validityClassSelector: '.control-label',
      placeholder: `Select a date`,
      mode: 'single',
      tests: [
        items => {
          if (items.length === 0) {
            return 'Please provide a value.'
          }
          return
        },
      ]
    })
  },
  buildFileField (spec) {
    return new OneLineMediaInputView({
      type: 'file',
      label: spec.label,
      name: spec.order.toString(),
      value: new MediaFileModel(),
      required: spec.required,
      maxFileSize: config.files.max_upload_size
    })
  },
  buildOptionsField (spec) {
    return new SelectView({
      label: spec.label,
      name: spec.order.toString(),
      multiple: false,
      tags: false,
      options: spec.options,
      value: spec.value,
      required: spec.required,
      idAttribute: 'id',
      textAttribute: 'label',
      //styles: 'form-group',
      unselectedText: `Select a ${spec.label}`,
      requiredMessage: 'Selection required',
      invalidClass: 'text-danger',
      validityClassSelector: '.control-label'
    })
  },
  buildRemoteOptionsField (spec) {
    var options = {
      label: spec.label,
      name: spec.order.toString(),
      multiple: false,
      tags: false,
      required: spec.required,
      unselectedText: `Select a ${spec.label}`,
      requiredMessage: 'Selection required',
      invalidClass: 'text-danger',
      validityClassSelector: '.control-label',
      idAttribute: spec.id_attribute,
      textAttribute: spec.text_attribute
    }

    if (isURL(spec.endpoint_url, {
      protocols: ['http', 'https'],
      require_protocol: true
    })) {
      options.ajaxUrl = spec.endpoint_url
    }

    return new SelectView(options)
  }
})
