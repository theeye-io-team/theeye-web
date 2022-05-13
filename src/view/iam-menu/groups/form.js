import FormView from 'ampersand-form-view'
import InputView from 'components/input-view'
import MembersSelectView from 'view/members-select'
import PolicySelectView from '../policy-selector'

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
        required: true,
        value: this.model.members,
        idAttribute: 'id',
      }),
      new PolicySelectView({
        required: true,
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
