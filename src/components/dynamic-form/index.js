import FIELD from 'constants/field'
import DropableForm from 'components/dropable-form'
import InputView from 'components/input-view'
import SelectView from 'components/select2-view'
import HelpIcon from 'components/help-icon'
import Datepicker from 'components/input-view/datepicker'
import OneLineMediaInputView from 'components/input-view/media/oneline'
import MediaFileModel from './media-file'
import isURL from 'validator/lib/isURL'
import isEmail from 'validator/lib/isEmail'
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
      case FIELD.TYPE_EMAIL:
        field = this.buildEmailField(spec)
        break
      case FIELD.TYPE_REGEXP:
        field = this.buildRegexpField(spec)
        break
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
      type: spec.masked ? 'password' : 'text',
      tests: [
        value => {
          const { pattern, charset, charsmin, charsmax } = spec

          if (charset) {
            switch (charset) {
              case 'alnum':
                break;
              case 'alpha':
                break;
              case 'num':
                break;
            }
          }
          if (charsmin && charsmin > 0) {
            if (value.length < charsmin) {
              return `Value must be at least ${charsmin} length`
            }
          }
          if (charsmax && charsmax > 0) {
            if (value.length > charsmax) {
              return `Value must be at most ${charsmax} length`
            }
          }
          if (pattern) {
            try {
              let regex = new RegExp(pattern)
              if (regex.test(value) === false) {
                return `The value is not correctly formatted`
              }
            } catch (e) {
              return `Cannot verify value. Contact an administrator`
            }
          }
        }
      ]
    })
  },
  buildEmailField (spec) {
    return new InputView({
      label: spec.label,
      name: spec.order.toString(),
      required: spec.required,
      invalidClass: 'text-danger',
      validityClassSelector: '.control-label',
      value: spec.value,
      type: 'email',
      tests: [
        value => {
          if (!isEmail(value)) {
            return 'Enter a valid email'
          }
        },
      ]
    })
  },
  buildRegexpField (spec) {
    return new InputView({
      label: spec.label,
      name: spec.order.toString(),
      required: spec.required,
      invalidClass: 'text-danger',
      validityClassSelector: '.control-label',
      value: spec.value,
      type: 'text',
      tests: [
        pattern => {
          try {
            new RegExp(pattern)
          } catch (e) {
            return 'Regular Expression is not valid'
          }
        },
      ]
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
