import FormView from 'ampersand-form-view'
import InputView from 'components/input-view'
import TheeyeCheckboxView from 'components/theeye-checkbox-view'
import SelectView from 'components/select2-view'
import isEmail from 'validator/lib/isEmail'

import App from 'ampersand-app'

module.exports = FormView.extend({
  initialize: function (options) {
    var isNew = this.model.isNew()
    this.fields = [
      new InputView({
        name: 'name',
        label: 'Name',
        value: this.model.name,
        required: true,
        invalidClass: 'text-danger',
        validityClassSelector: '.control-label',
        readonly: !isNew
      }),
      new InputView({
        name: 'description',
        label: 'Description',
        value: this.model.description,
        invalidClass: 'text-danger',
        validityClassSelector: '.control-label',
        required: false,
        autofocus:true
      }),
      new SelectView({
        multiple: true,
        tags: true,
        styles: 'form-group',
        name: 'emails',
        required: false,
        label: 'Emails',
        options: this.model.emails.map( e => { return { id: e, text: e } }),
        value: this.model.emails.map( e => { return { id: e, text: e } }),
        unselectedText: 'Enter an email',
        requiredMessage: 'Enter at least one email',
        invalidClass: 'text-danger',
        validityClassSelector: '.control-label',
        allowCreateTags: true,
        type: 'email',
        tests: [
          function (values) {
            if (!values) return
            if (values.some(v => {
              return !isEmail(v) 
            })) {
              return 'Please provide valid emails'
            }
          }
        ]
      }),
      new InputView({
        name: 'kibana',
        label: 'Kibana iframe',
        placeholder: 'Kibana iframe',
        value: this.model.config.kibana,
        invalidClass: 'text-danger',
        validityClassSelector: '.control-label',
        required: false
      }),
      new TheeyeCheckboxView({
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
        value: this.model.config.elasticsearch.url
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
        value: urlValue
      })
      this.addField(elasticsearchUrl)
      this.renderField(elasticsearchUrl)
    } else {
      this.getField('elasticsearch_url').remove()
      this.removeField('elasticsearch_url')
    }
  }
})
