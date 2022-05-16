import App from 'ampersand-app'
import FormView from 'ampersand-form-view'
import SelectView from 'components/select2-view'
import PolicySelectView from 'view/iam-menu/policy-selector'

export default FormView.extend({
  initialize: function (options) {
    const credentials = App.state.credentials.filter(e => {
      let notIn = ['root']
      if (App.state.session.user.credential === 'manager') {
        notIn.push('admin')
        notIn.push('owner')
      }
      return (notIn.indexOf(e.name) === -1)
    })

    this.fields = [
      new SelectView({
        options: credentials,
        value: this.model.credential,
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
    this.query('select[name=credential]').focus()
  }
})
