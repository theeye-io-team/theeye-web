import FormView from 'ampersand-form-view'
import InputView from 'components/input-view'
import CheckboxView from 'components/checkbox-view'
import SelectView from 'components/select2-view'
import isURL from 'validator/lib/isURL'
import isEmail from 'validator/lib/isEmail'

import App from 'ampersand-app'

export default FormView.extend({
  props: {
    showKibana: ['boolean', false, false],
    kibanaUrlInput: 'object'
  },
  initialize: function (options) {
    var isNew = this.model.isNew()

    this.showKibana = (!isNew ? this.model.config.kibana.enabled : false)
    this.fields = [
      new InputView({
        name: 'name',
        label: 'Name',
        value: this.model.name,
        required: true,
        invalidClass: 'text-danger',
        validityClassSelector: '.control-label',
        readonly: !isNew,
        tests: [
          (value) => {
            if (!isEmail(`${value}@theeye.io`)) {
              return 'Please provide a valid customer name'
            }
          }
        ]
      }),
      new InputView({
        name: 'description',
        label: 'Description',
        value: this.model.description,
        invalidClass: 'text-danger',
        validityClassSelector: '.control-label',
        required: false,
        autofocus: true
      }),
      new CheckboxView({
        name: 'kibana_enabled',
        label: 'Kibana enabled',
        value: (!isNew ? this.model.config.kibana.enabled : false)
      }),
      this.kibanaUrlInput = new InputView({
        name: 'kibana_url',
        label: 'Kibana iframe',
        placeholder: 'Kibana iframe',
        visible: this.showKibana,
        value: (!isNew ? this.model.config.kibana.url : ''),
        invalidClass: 'text-danger',
        validityClassSelector: '.control-label',
        required: this.showKibana
      }),
      new CheckboxView({
        name: 'elasticsearch_enabled',
        label: 'Elasticsearch enabled',
        value: (!isNew ? this.model.config.elasticsearch.enabled : false)
      })
    ]

    if (!isNew && this.model.config.elasticsearch.enabled) {
      const elasticsearchUrl = new InputView({
        name: 'elasticsearch_url',
        label: 'Elasticsearch url',
        placeholder: 'Elastic search url',
        invalidClass: 'text-danger',
        validityClassSelector: '.control-label',
        required: true,
        value: this.model.config.elasticsearch.url,
        tests: [
          function (value) {
            if(!isURL(value,{
              protocols: ['http','https'],
              require_protocol: true
            })) {
              return "Must be a valid URL (include protocol)"
            }
          }
        ]
      })

      this.fields.push(elasticsearchUrl)
    }

    FormView.prototype.initialize.apply(this, arguments)
  },
  render () {
    FormView.prototype.render.apply(this, arguments)
    this.query('form').classList.add('form-horizontal')
  },
  events: {
    'change input[name=elasticsearch_enabled]': function (event) {
      this.togglePasswordFields(event.target.checked)
    },
    'change input[name=kibana_enabled]': function (event) {
      this.showKibana = event.target.checked
      this.kibanaUrlInput.set({visible: this.showKibana, required: this.showKibana})
    }
  },
  togglePasswordFields: function (on) {
    var isNew = this.model.isNew()
    var urlValue = (!isNew && this.model.config.elasticsearch.url) ? this.model.config.elasticsearch.url : ''

    if (on) {
      const elasticsearchUrl = new InputView({
        name: 'elasticsearch_url',
        label: 'Elasticsearch url',
        placeholder: 'Elastic search url',
        invalidClass: 'text-danger',
        validityClassSelector: '.control-label',
        required: true,
        value: urlValue,
        tests: [
          function (value) {
            if(!isURL(value,{
              protocols: ['http','https'],
              require_protocol: true
            })) {
              return "Must be a valid URL (include protocol)"
            }
          }
        ]
      })
      this.addField(elasticsearchUrl)
      this.renderField(elasticsearchUrl)
    } else {
      this.getField('elasticsearch_url').remove()
      this.removeField('elasticsearch_url')
    }
  }
})
