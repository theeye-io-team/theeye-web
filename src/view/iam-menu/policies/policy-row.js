import App from 'ampersand-app'
import View from 'ampersand-view'
import bootbox from 'bootbox'
import Modalizer from 'components/modalizer'
import Form from './form'

export default View.extend({
  template: `
    <div class="row border social">
      <div class="col-xs-8">
        <div class="social-container">
          <span class="circle" style="background:#073666"></span>
          <span class="legend" data-hook="name"></span>
        </div>
      </div>
      <div class="col-xs-2">
        <span data-hook="count"></span>
      </div>
      <div class="col-xs-2">
        <div data-hook="group-icons" class="pull-right action-icons">
          <span><i class="fa fa-eye blue" data-hook="show-policy"></i></span>
          <span><i class="fa fa-edit blue" data-hook="edit-policy"></i></span>
          <span><i class="fa fa-trash blue" data-hook="remove-policy"></i></span>
        </div>
      </div>
    </div>
  `,
  props: {
    visible: ['boolean', true, true]
  },
  bindings: {
    'model.name': {
      hook:'name'
    },
    'model.members.length': {
      hook:'count'
    },
    'visible': {
      type: 'toggle'
    }
  },
  events: {
    'click [data-hook=remove-policy]': 'removePolicy',
    'click [data-hook=edit-policy]': 'editPolicy',
    'click [data-hook=show-policy]': 'showPolicy',
  },
  showPolicy (event) {
    event.preventDefault()
    event.stopPropagation()

    const content = new DisplayPolicy({ model: this.model })
    const modal = new Modalizer({
      center: true,
      title: 'Show Policy ' + this.model.name,
      bodyView: content,
      buttons: false
    })

    modal.on('shown', () =>  { form.focus() })
    modal.on('hidden', () => {
      content.remove()
      modal.remove()
    })

    modal.show()
  },
  removePolicy: function (event) {
    event.stopPropagation()
    bootbox.confirm(`Are you sure you want to remove the group "${this.model.user.username}"?`,
      (confirmed) => {
        if (!confirmed) { return }
        console.log("TODO")
      }
    )
  },
  editPolicy: function (event) {
    event.stopPropagation()
    const form = new Form({ model: this.model })
    const modal = new Modalizer({
      title: 'Edit group' + this.model.name,
      bodyView: form,
      buttons: true,
      confirmButton: 'Save'
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
      App.actions.groups.update(this.model.id, data)
      modal.hide()
    })
    modal.show()
  }
})

const DisplayPolicy = View.extend({
  template: ` <div>Hola Eze</div> `
})
