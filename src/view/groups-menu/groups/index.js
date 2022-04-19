import App from 'ampersand-app'
import View from 'ampersand-view'
import Modalizer from 'components/modalizer'
import Form from './form'
import { Model as GroupModel } from 'models/group'

export default View.extend({
  template: `
    <div>
      <h3 class="bold blue">Groups</h3>
      <button class="btn" data-hook="create-group">Create group</button>
      <div data-hook="group-list-container"></div>
    </div>
  `,
  events: {
    'click [data-hook=create-group]': 'createGroup'
  },
  createGroup () {
    const model = new GroupModel()
    const form = new Form({ model })
    const modal = new Modalizer({
      title: 'Create group',
      bodyView: form,
      buttons: true,
      confirmButton: 'Create Group'
    })
    // this.listenTo(modal, 'shown', function () { form.focus() })
    this.listenTo(modal, 'hidden', function () {
      form.remove()
      modal.remove()
    })
    this.listenTo(modal, 'confirm', function () {
      form.beforeSubmit()
      if (!form.valid) return

      let data = form.prepareData()
      App.actions.groups.create(data)
      modal.hide()
    })
    modal.show()
  }
})