import FormView from 'ampersand-form-view'
import InputView from 'components/input-view'
import isURL from 'validator/lib/isURL'

import App from 'ampersand-app'

module.exports = FormView.extend({
  initialize: function (options) {
    this.fields = [
      new InputView({
        name: 'kibana',
        label: 'Kibana iframe',
        placeholder: 'Kibana iframe',
        value: this.model.config.kibana,
        invalidClass: 'text-danger',
        validityClassSelector: '.control-label',
        required: false
      }),
    ]
    FormView.prototype.initialize.apply(this, arguments)
  },
  render () {
    FormView.prototype.render.apply(this, arguments)
    this.query('form').classList.add('form-horizontal')
  },
  focus () {
    this.query('input[name=kibana]').focus()
  }
})
