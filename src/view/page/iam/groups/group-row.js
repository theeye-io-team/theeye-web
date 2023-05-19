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
        <i class="fa fa-credential"></i>
        <span data-hook="credential"></span>
      </div>
      <div class="col-xs-2">
        <span><i class="fa fa-lock blue" data-hook="builtin-group"></i></span>
        <div data-hook="group-icons" class="pull-right action-icons">
          <span><i class="fa fa-edit blue" data-hook="edit-group"></i></span>
          <span><i class="fa fa-trash blue" data-hook="remove-group"></i></span>
        </div>
      </div>
    </div>
  `,
  props: {
    visible: ['boolean', true, true]
  },
  bindings: {
    'model.builtIn': [{
      hook: 'edit-group',
      type: 'booleanClass',
      yes: '',
      no: 'blue'
    },{
      hook: 'remove-group',
      type: 'booleanClass',
      yes: '',
      no: 'blue'
    },{
      hook: 'edit-group',
      type: 'toggle',
      invert: true
    },{
      hook: 'remove-group',
      type: 'toggle',
      invert: true
    },{
      hook: 'builtin-group',
      type: 'toggle'
    }],
    'model.name': {
      hook:'name'
    },
    'model.credential': {
      hook:'credential'
    },
    'visible': {
      type: 'toggle'
    }
  },
  events: {
    'click [data-hook=remove-group]': 'removeGroup',
    'click [data-hook=edit-group]': 'editGroup'
  },
  removeGroup (event) {
    event.preventDefault()
    event.stopPropagation()
    if (this.model.builtIn === true) {
      return false 
    }

    bootbox.confirm(`Are you sure you want to remove the group "${this.model.name}"?`,
      (confirmed) => {
        if (!confirmed) { return }
        App.actions.groups.remove(this.model.id)
      }
    )
  },
  editGroup (event) {
    event.preventDefault()
    event.stopPropagation()
    if (this.model.builtIn === true) {
      return false 
    }

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
