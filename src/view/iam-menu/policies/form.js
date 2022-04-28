import App from 'ampersand-app'
import FormView from 'ampersand-form-view'
import View from 'ampersand-view'
import InputView from 'components/input-view'

export default FormView.extend({
  initialize () {
    debugger
    this.fields = [
      new InputView({
        name: 'name',
        label: 'Policy name',
        value: this.model.name,
        required: true,
        invalidClass: 'text-danger',
        validityClassSelector: '.control-label',
      }),
      // new MembersSelectView({
      //   name: 'members',
      //   value: this.model.members,
      //   idAttribute: 'id',
      // })
    ]
    FormView.prototype.initialize.apply(this, arguments)
  },
  prepareData() {
    let data = Object.assign({}, this.data)
    data.customer = App.state.session.customer.id
    return data
  }
})

const permissionList = View.extend({
  template: `
  <div class="form-group">
    <div class="input-container" data-hook="input-container"></div>
    <div class="permission-list">
     <div class="row">
       <div class="col-xs8">Task name</div>
       <div class="col-xs1">Can edit</div>
       <div class="col-xs1">Can execute</div>
       <div class="col-xs1">Remove</div>
     </div> 
     <div data-hook="task-list"></div>
    </div>
  </div>`,
  initialize () {

  }
})

