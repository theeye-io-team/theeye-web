import App from 'ampersand-app'
import FormView from 'ampersand-form-view'
import InputView from 'components/input-view'
import MembersSelectView from 'view/members-select'
import SelectView from 'components/select2-view'

export default FormView.extend({
  initialize () {
    const isNewTask = Boolean(this.model.isNew()) // or is import

    this.fields = [
      new InputView({
        name: 'name',
        label: 'Group name',
        value: this.model.name,
        required: true,
        invalidClass: 'text-danger',
        validityClassSelector: '.control-label',
      }),
      new MembersSelectView({
        name: 'members',
        value: this.model.members,
        idAttribute: 'id',
      }),
      new PolicySelectView({
        value: this.model.policies
      })
    ]
    FormView.prototype.initialize.apply(this, arguments)
  },
  //prepareData() {
  //  let data = Object.assign({}, this.data)
  //  data.customer = App.state.session.customer.id
  //  return data
  //},
  submit () {
    this.beforeSubmit()
    if (this.valid) {
      let data = this.data
      this.trigger('submit', data)
    }
  },
})

const PolicySelectView = SelectView.extend({
  initialize (specs) {
    this.options = App.state.policies 
    this.multiple = true
    this.tags = false
    this.label = 'Policy Selection'
    this.name = 'policies'
    this.styles = 'form-group'
    this.unselectedText = 'select a policy'
    this.idAttribute = 'id'
    this.textAttribute = 'name'
    this.allowCreateTags = false

    SelectView.prototype.initialize.apply(this, arguments)
  }
})
