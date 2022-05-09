import App from 'ampersand-app'
import FormView from 'ampersand-form-view'
import InputView from 'components/input-view'
import isEmail from 'validator/lib/isEmail'
import SelectView from 'components/select2-view'
import PolicySelectView from '../policy-selector'

export default FormView.extend({
  initialize: function (options) {

    const credentials = App.state.credentials.filter(e => {
      const notIn = ['root']
      if (App.state.session.user.credential === 'manager') {
        notIn.push('admin')
      }
      return (notIn.indexOf(e.name) === -1)
    })

    this.fields = [
      new InputView({
        name: 'name',
        label: 'Name',
        required: true,
        invalidClass: 'text-danger',
        validityClassSelector: '.control-label'
      }),
      new InputView({
        name: 'email',
        label: 'Email',
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
        unselectedText: 'credential',
        idAttribute: 'name',
        textAttribute: 'name',
        invalidClass: 'text-danger',
        validityClassSelector: '.control-label'
      }),
      new PolicySelectView()
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
