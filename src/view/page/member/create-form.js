import App from 'ampersand-app'
import FormView from 'ampersand-form-view'
import InputView from 'components/input-view'
import isEmail from 'validator/lib/isEmail'
import SelectView from 'components/select2-view'

export default FormView.extend({
  initialize: function (options) {
    const isNew = this.model.isNew()

    const credentials = App.state.credentials.filter(e => {
      let notIn = ['root']
      if (App.state.session.user.credential === 'manager') {
        notIn.push('admin')
        notIn.push('owner')
      }
      return (notIn.indexOf(e.name) === -1)
    })

    this.fields = [
      new InputView({
        name: 'name',
        label: 'Name',
        value: this.model.name,
        required: true,
        readonly: !isNew,
        invalidClass: 'text-danger',
        validityClassSelector: '.control-label'
      }),
      new InputView({
        name: 'email',
        label: 'Email',
        value: this.model.email,
        readonly: !isNew,
        tests: [
          function (value) {
            if (!isEmail(value)) {
              return 'Please provide a valid email'
            }
          }
        ],
        required: true,
        invalidClass: 'text-danger',
        validityClassSelector: '.control-label'
      }),
      new SelectView({
        options: credentials,
        styles: 'form-group',
        name: 'credential',
        required: true,
        label: 'Credential',
        value: this.model.credential,
        unselectedText: 'credential',
        idAttribute: 'name',
        textAttribute: 'name',
        invalidClass: 'text-danger',
        validityClassSelector: '.control-label'
      }),
      new SelectView({
        options: App.state.admin.customers,
        styles: 'form-group',
        name: 'customer_id',
        value: this.model.customer_id,
        required: true,
        label: 'Customer',
        unselectedText: 'customer',
        idAttribute: 'id',
        textAttribute: 'name',
        invalidClass: 'text-danger',
        validityClassSelector: '.control-label'
      }),
    ]

    FormView.prototype.initialize.apply(this, arguments)
  },
  render () {
    FormView.prototype.render.apply(this, arguments)
    this.query('form').classList.add('form-horizontal')
  },
  focus () {
    this.query('input[name=email]').focus()
  }
})
