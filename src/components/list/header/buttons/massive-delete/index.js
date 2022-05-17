import MassiveButton from '../massive-action'
import bootbox from 'bootbox'

export default MassiveButton.extend({
  props: {
    name: 'string', // what is being deleted ?
    displayProperty: 'string' // which property of the item are we going to display
  },
  initialize (options) {
    MassiveButton.prototype.initialize.apply(this,arguments)

    this.title = 'Delete'
    this.iconClass = 'fa fa-trash'
    this.className = 'btn btn-primary'
  },
  getSelectedItems () {
    return this.parent.parent.getSelected().map(i => i.model)
  },
  onClickButton (event) {
    event.stopPropagation()
    event.preventDefault()

    const itemsToDelete = this.getSelectedItems()
    if (itemsToDelete.length === 0) { return }
    this.askConfirmation(itemsToDelete)
  },
  askConfirmation (items) {
    const self = this

    bootbox.confirm({
      title: 'Massive delete',
      message: `
        <p class="bg-danger" style="padding:15px">
          You are about to delete ${items.length} ${this.name}
        </p>
        <br/><br/>
        <h3>Are you sure?</h3>
      `,
      buttons: {
        confirm: {
          label: 'Yes',
          className: 'btn-danger'
        },
        cancel: {
          label: 'No',
          className: 'btn-default'
        }
      },
      callback: confirm => {
        if (confirm === true) {
          self.deleteItems(items)
        }
      }
    })
  },
  deleteItems (items) {
    console.warn('no action defined')
    bootbox.alert('Hey! I do not know how to delete this items. I am sorry...')
  }
})
