import View from 'ampersand-view'
import ArgumentForm from './form'
import Modalizer from 'components/modalizer'
module.exports = View.extend({
  template: `
    <li class="list-group-item">
      <div class="row">
        <span class="col-xs-3" data-hook="label"></span>
        <span class="col-xs-3" data-hook="type"></span>
        <span class="col-xs-3" data-hook="value"></span>
        <span class="col-xs-3">
          <div class="fright">
            <button class="btn btn-default btn-sm" data-hook="edit-script-argument">
              <i class="fa fa-edit"></i>
            </button>
            <button class="btn btn-default btn-sm" data-hook="remove-script-argument">
              <i class="fa fa-trash"></i>
            </button>
          </div>
        </span>
      </div>
    </li>
  `,
  bindings: {
    'model.label': { hook: 'label' },
    'model.type': { hook: 'type' },
    'model.value': { hook: 'value' },
  },
  events: {
    'click [data-hook=edit-script-argument]':'onClickEditScriptArgument',
    'click [data-hook=remove-script-argument]':'onClickRemoveScriptArgument',
  },
  onClickEditScriptArgument (event) {
    event.preventDefault()
    event.stopPropagation()

    const form = new ArgumentForm({ model: this.model })
    const modal = new Modalizer({
      buttons: false,
      title: 'Edit Argument',
      bodyView: form
    })

    this.listenTo(modal,'hidden',() => {
      form.remove()
      modal.remove()
    })

    this.listenTo(form,'submit', () => {
      this.model.set( form.data )
      modal.hide()
    })

    modal.show()

    return false
  },
  onClickRemoveScriptArgument (event) {
    event.preventDefault()
    event.stopPropagation()
    this.model.collection.remove(this.model.id)
    return false
  }
})
