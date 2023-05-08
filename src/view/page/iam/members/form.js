import App from 'ampersand-app'
import FormView from 'ampersand-form-view'
import InputView from 'components/input-view'
import isEmail from 'validator/lib/isEmail'
import CredentialsSelector from 'view/credentials-selector'
//import PolicySelector from '../policy-selector'

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
      new CredentialsSelector({
        lable: 'Role',
        value: this.model.credential
      })
      //new PolicySelector()
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
