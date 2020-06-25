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
    const confirmModalStart = new Date()
    const propsToDisplay = items.map(item => item[this.displayProperty])

    bootbox.confirm({
      title: 'Massive delete',
      message: confirmTemplate({ name: this.name, items: propsToDisplay }),
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
        bootbox.confirm({
          title: '<h2>Heads up!</h2>',
          message: reconfirmTemplate({
            name: this.name,
            items: propsToDisplay
          }),
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

const confirmTemplate = (state) => {
  const { name, items } = state
  let message = items.map(item => `<strong>${item}</strong><br />`)

  let html = `
    <p class="bg-danger" style="padding:15px">You are about to delete these ${name}:</p>
    ${message}
    <br/><br/>
    <h3>Are you sure?</h3>
    `

  return html
}

const reconfirmTemplate = (state) => {
  const { name, items } = state

  let message = items.map(item => `<strong>${item}</strong><br />`)

  let html = `
    <p class="lead">You are deleting <strong>${name}</strong>.
      Take a good look at them,
      'cos they will be gone forever when you hit that <span class="label label-danger">Yes</span> button.
      <br /><br />
      ${message}
    </p>
    <br/>
    <h3>Are you <strong>completely</strong> sure?</h3>
  `

  return html
}
