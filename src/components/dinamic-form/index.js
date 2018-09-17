import FIELD from 'constants/field'
import FormView from 'ampersand-form-view'
import InputView from 'components/input-view'
import SelectView from 'components/select2-view'
import HelpIcon from 'components/help-icon'
import Datepicker from 'components/input-view/datepicker'
import OneLineMediaInputView from 'components/input-view/media/oneline'
import MediaFileModel from './media-file'
import isURL from 'validator/lib/isURL'
import config from 'config'

module.exports = FormView.extend({
  props: {
    fieldsDefinitions: 'array'
  },
  initialize (options) {
    const fieldsSpecs = options.fieldsDefinitions
    const fields = []

    fieldsSpecs.forEach(spec => {
      if (spec.type === FIELD.TYPE_INPUT) {
        fields.push(
          new InputView({
            label: spec.label,
            name: spec.order.toString(),
            required: spec.required,
            invalidClass: 'text-danger',
            validityClassSelector: '.control-label',
            value: spec.value
          })
        )
      } else if (spec.type === FIELD.TYPE_SELECT) {
        fields.push(
          new SelectView({
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
        )
      }  else if (spec.type === FIELD.TYPE_DATE) {
        fields.push(
          new Datepicker({
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
        )
      }  else if (spec.type === FIELD.TYPE_FILE) {
        fields.push(
          new OneLineMediaInputView({
            type: 'file',
            label: spec.label,
            name: spec.order.toString(),
            value: new MediaFileModel(),
            required: spec.required,
            maxFileSize: config.files.max_upload_size
          })
        )
      } else if (spec.type === FIELD.TYPE_REMOTE_OPTIONS) {
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

        fields.push(new SelectView(options))
      }
    })

    this.fields = fields

    FormView.prototype.initialize.apply(this,arguments)
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
  focus () {
    const eles = this.queryAll('.form-control')
    if (eles.length==0) { return }
    eles[0].autofocus = true
    eles[0].focus()
  },
  render () {
    FormView.prototype.render.apply(this, arguments)
    this.query('form').classList.add('form-horizontal')
    this.renderHelpIcons()

    this.focus()
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
  }
})
