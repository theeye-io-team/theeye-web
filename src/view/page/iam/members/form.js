import App from 'ampersand-app'
import FormView from 'ampersand-form-view'
import InputView from 'components/input-view'
import isEmail from 'validator/lib/isEmail'
import CredentialSelector from 'view/credentials-selector'
import RolesSelector from '../roles-selector'
//import SimpleSwitch from 'components/simple-switch'

export default FormView.extend({
  initialize (options) {

    this.fields = [
      new InputView({
        name: 'name',
        label: 'Name',
        required: true,
        invalidClass: 'text-danger',
        validityClassSelector: '.control-label',
        value: this.model.name
      }),
      new CredentialSelector({
        label: 'Credential',
        name: 'credential',
        value: this.model.credential
      }),
      new RolesSelector({
        label: 'Roles',
        name: 'roles',
        multiple: true,
        value: this.model.roles
      })
    ]
    
    if (this.model.isNew()) {
      this.fields.push(
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
        })
      )
    }

    FormView.prototype.initialize.apply(this, arguments)
  },
  render () {
    FormView.prototype.render.apply(this, arguments)
    this.query('form').classList.add('form-horizontal')
  },
  focus () {
    this.query('input[name=name]').focus()
  }
})
