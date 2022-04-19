import FormView from 'ampersand-form-view'
import InputView from 'components/input-view'
import CheckboxView from 'components/checkbox-view'
//import isURL from 'validator/lib/isURL'

export default FormView.extend({
  initialize: function (options) {
    this.fields = [
      new CheckboxView({
        name: 'elasticsearch_enabled',
        label: 'Elasticsearch enabled',
        value: this.model.config.elasticsearch.enabled
      }),
      new InputView({
        name: 'elasticsearch_url',
        label: 'Elasticsearch url',
        placeholder: 'Elastic search url',
        invalidClass: 'text-danger',
        validityClassSelector: '.control-label',
        required: true,
        value: this.model.config.elasticsearch.url,
        //tests: [
        //  function (value) {
        //    if(!isURL(value,{
        //      protocols: ['http','https'],
        //      require_protocol: true
        //    })) {
        //      return "Must be a valid URL (include protocol)"
        //    }
        //  }
        //]
      })
    ]
    FormView.prototype.initialize.apply(this, arguments)
  },
  render () {
    FormView.prototype.render.apply(this, arguments)
    this.query('form').classList.add('form-horizontal')
  },
  focus () {
    this.query('input[name=elasticsearch_url]').focus()
  }
})
