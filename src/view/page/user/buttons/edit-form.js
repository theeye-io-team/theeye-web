import Cookies from 'js-cookie'
import FormView from 'ampersand-form-view'
import SelectView from 'components/select2-view'
import InputView from 'components/input-view'
import Collection from 'ampersand-collection'
import TheeyeCheckboxView from 'components/theeye-checkbox-view'
import App from 'ampersand-app'

function getMyCredentials () {
  const cookie = Cookies.get('theeye')
  var parsedCookie = {}
  try {
    parsedCookie = JSON.parse(cookie)
  } catch (err) {
    console.log('can not parse cookie')
  }

  const mycred = parsedCookie.credential
  const credentials = new Collection(App.state.credentials.models)
  if (mycred === 'root') {
    credentials.add({
      id: 'root',
      name: 'root',
      description: 'Root'
    })
  }
  return credentials
}

export default FormView.extend({
  initialize: function (options) {
    this.fields = [
      new InputView({
        name: 'username',
        label: 'Username',
        value: this.model.username,
        required: true,
        invalidClass: 'text-danger',
        validityClassSelector: '.control-label'
      }),
      new InputView({
        name: 'email',
        label: 'Email',
        value: this.model.email,
        tests: [
          function (value) {
            const regex = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i
            if (!regex.test(value)) {
              return 'Please provide a valid email'
            }
          }
        ],
        required: true,
        invalidClass: 'text-danger',
        validityClassSelector: '.control-label'
      }),
      new SelectView({
        multiple: true,
        tags: true,
        options: App.state.customers,
        styles: 'form-group',
        name: 'customers',
        required: true,
        label: 'Customers',
        //value: this.model.customers.map(customer => customer.id),
        value: this.model.customers,
        unselectedText: 'organizations',
        idAttribute: 'id',
        textAttribute: 'name',
        requiredMessage: 'Selection required',
        invalidClass: 'text-danger',
        validityClassSelector: '.control-label'
      }),
      new SelectView({
        options: getMyCredentials(),
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
      new TheeyeCheckboxView({
        name: 'enabled',
        label: 'Enabled',
        value: this.model.enabled
      })
    ]
    FormView.prototype.initialize.apply(this, arguments)
  },
  render () {
    FormView.prototype.render.apply(this, arguments)
    this.query('form').classList.add('form-horizontal')
  },
  focus () {
    this.query('input[name=username]').focus()
  }
})
