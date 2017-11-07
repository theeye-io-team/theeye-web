import MassiveButton from '../massive-action'
import bootbox from 'bootbox'
import map from 'lodash/map'

const confirmTemplate = require('./confirm.hbs')
const reconfirmTemplate = require('./reconfirm.hbs')

module.exports = MassiveButton.extend({
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
    const confirmModalStart = new Date()
    const propsToDisplay = map(items, this.displayProperty)
    var confirmMessage
      
    confirmMessage = confirmTemplate({
      name: this.name,
      items: propsToDisplay
    })

    bootbox.confirm({
      title: 'Massive delete',
      message: confirmMessage,
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
        if (!confirm) { return }
        const timeToDecide = new Date() - confirmModalStart
        const tooFast = timeToDecide < 3000

        confirmMessage = reconfirmTemplate({
          name: this.name,
          items: propsToDisplay,
          tooFast: tooFast,
          timeTaken: timeToDecide / 1000
        })

        bootbox.confirm({
          title: '<h2>Heads up!</h2>',
          message: confirmMessage,
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
            if (!confirm) { return }
            // ok, delete them
            self.deleteItems(items)
          }
        })
      }
    })
  },
  deleteItems (items) {
    console.warn('no action defined')
    bootbox.alert('Hey! I do not know how to delete this items. I am sorry...')
  }
})
