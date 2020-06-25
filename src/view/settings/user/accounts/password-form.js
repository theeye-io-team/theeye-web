import FormView from 'ampersand-form-view'
import InputView from 'components/input-view'

export default FormView.extend({
  initialize: function (options) {

    const newPasswordInput = new InputView({
      type: 'password',
      label: 'New password',
      name: 'newPassword',
      required: true,
      invalidClass: 'text-danger',
      validityClassSelector: '.control-label',
      tests: [
        function (value) {
          if (value.length < 8) {
            return "Must have at least 8 characters";
          }
        }
      ]
    })

    this.fields = [
      new InputView({
        type: 'password',
        name: 'password',
        label: 'Password',
        required: true,
        invalidClass: 'text-danger',
        validityClassSelector: '.control-label',
        tests: [
          function (value) {
            if (value.length < 8) {
              return "Must have at least 8 characters";
            }
          }
        ]
      }),
      newPasswordInput,
      new InputView({
        type: 'password',
        name: 'confirmPassword',
        label: 'Confirm new password',
        tests: [
          function (value) {
            if (value !== newPasswordInput.value) {
              return "Passwords does not match.";
            }
          }
        ],
        required: true,
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
    this.query('input[name=password]').focus()
  }
})
