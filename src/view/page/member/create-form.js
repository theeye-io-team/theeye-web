import App from 'ampersand-app'
import FormView from 'ampersand-form-view'
import InputView from 'components/input-view'
import isEmail from 'validator/lib/isEmail'
import SelectView from 'components/select2-view'
//import PolicySelectView from 'view/page/iam/policy-selector'

export default FormView.extend({
  initialize (options) {

    const credentials = App.state.credentials.filter(e => {
      let notIn = ['root']
      if (App.state.session.user.credential === 'manager') {
        notIn.push('admin')
        notIn.push('owner')
      }
      return (notIn.indexOf(e.name) === -1)
    })

    //const email = new InputView({
    const email = new SelectView({
      options: App.state.admin.users,
      name: 'email',
      label: 'Email',
      tags: true,
      allowCreateTags: true,
      tests: [
        value => {
          if (!isEmail(value)) {
            return 'Please provide a valid email'
          }
        }
      ],
      idAttribute: 'email',
      textAttribute: 'email',
      required: true,
      invalidClass: 'text-danger',
      validityClassSelector: '.control-label'
    })

      //new SelectView({
      //  options: credentials,
      //  styles: 'form-group',
      //  name: 'credential',
      //  required: true,
      //  label: 'Credential',
      //  unselectedText: 'credential',
      //  idAttribute: 'name',
      //  textAttribute: 'name',
      //  invalidClass: 'text-danger',
      //  validityClassSelector: '.control-label'
      //}),

    const name = new InputView({
      name: 'name',
      label: 'Name',
      required: true,
      invalidClass: 'text-danger',
      validityClassSelector: '.control-label'
    })

    email.on('change', () => {
      if (email.valid === true) {
        let user = App.state.admin.users.find(u => u.email == email.value)
        if (!user) {
          name.setValue()
        } else {
          name.setValue(user.username)
        }
      }
    })

    this.fields = [
      email,
      name,
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
      new SelectView({
        options: App.state.admin.customers,
        styles: 'form-group',
        name: 'customer_id',
        required: true,
        label: 'Customer',
        unselectedText: 'customer',
        idAttribute: 'id',
        textAttribute: 'formatted_name',
        invalidClass: 'text-danger',
        validityClassSelector: '.control-label'
      }),
      //new PolicySelectView()
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
