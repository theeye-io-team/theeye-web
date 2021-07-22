import App from 'ampersand-app'

import * as FIELD from 'constants/field'
import DropableForm from 'components/dropable-form'
import InputView from 'components/input-view'
import TextareaView from 'components/input-view/textarea'
import SelectView from 'components/select2-view'
import HelpIcon from 'components/help-icon'
import Datepicker from 'components/input-view/datepicker'
import OneLineMediaInputView from 'components/input-view/media/oneline'
import MediaFileModel from './media-file'
import isURL from 'validator/lib/isURL'
import isEmail from 'validator/lib/isEmail'

export default DropableForm.extend({
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
          const file = this._fieldViews[key]._values.file
          const dataUrl = file.dataUrl
          if (dataUrl) {
            this.data[key].dataUrl = dataUrl
          }
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
      case FIELD.TYPE_JSON:
        field = this.buildJsonField(spec)
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
  buildJsonField (spec) {
    return new TextareaView({
      prettyJson: true,
      label: spec.label,
      name: spec.order.toString(),
      required: spec.required,
      value: spec.value,
      invalidClass: 'text-danger',
      validityClassSelector: '.control-label',
      tests: [
        value => {
          if (value === '') { return }
          try {
            JSON.parse(value)
          } catch (e) {
            return 'Invalid JSON string'
          }
        }
      ]
    })
  },
  buildTextField (spec) {
    return new InputView({
      label: spec.label,
      name: spec.order.toString(),
      required: spec.required,
      value: spec.value,
      type: spec.masked ? 'password' : 'text',
      invalidClass: 'text-danger',
      validityClassSelector: '.control-label',
      tests: [
        value => {
          const { pattern, charset, charsmin, charsmax } = spec

          if (charset) {
            switch (charset) {
              case 'alnum':
                if (/^[a-z0-9]+$/i.test(value) === false) {
                  return `The value should be alphanumeric`
                }
                break;
              case 'alpha':
                if (/^[a-z]+$/i.test(value) === false) {
                  return `The value should be alphabetical`
                }
                break;
              case 'num':
                if (/^[0-9]+$/i.test(value) === false) {
                  return `The value should be a number`
                }
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
          if (!value&&!spec.required) { return }
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
            if (!spec.required) { return }
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
      maxFileSize: App.config.files.max_upload_size
    })
  },
  buildOptionsField (spec) {
    return new SelectView({
      label: spec.label,
      name: spec.order.toString(),
      multiple: spec.multiple,
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
    const options = {
      label: spec.label,
      name: spec.order.toString(),
      multiple: spec.multiple,
      tags: false,
      required: spec.required,
      unselectedText: `Select a ${spec.label}`,
      requiredMessage: 'Selection required',
      invalidClass: 'text-danger',
      validityClassSelector: '.control-label',
      idAttribute: spec.id_attribute,
      textAttribute: spec.text_attribute,
      ajax: {
        url: spec.endpoint_url,
      }
    }

    //options.ajax.data = function (params) {
    //  let query
    //  if (params._type && params._type === 'query') {
    //    query = {
    //      q: params.term,
    //      limit: App.config.components.dynamic_form.remote.query_limit
    //    }
    //    //query.where[spec.text_attribute] = params.term
    //  }
    //  return query
    //}

    return new SelectView(options)
  }
})
