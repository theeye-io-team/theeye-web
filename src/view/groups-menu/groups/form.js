import App from 'ampersand-app'
import FormView from 'ampersand-form-view'
import InputView from 'components/input-view'
import MembersSelectView from 'view/members-select'

export default FormView.extend({
  initialize () {
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
      })
    ]
    FormView.prototype.initialize.apply(this, arguments)
  },
  prepareData() {
    debugger
    let data = Object.assign({}, this.data)
    data.customer = App.state.session.customer.id
    console.log(data)
    return data
  }
})