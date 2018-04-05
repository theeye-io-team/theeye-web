import Modalizer from 'components/modalizer'
import bootbox from 'bootbox'
import FormView from './form'

module.exports = function (monitor) {
  const form = new FormView({ model: monitor })

  const modal = new Modalizer({
    buttons: false,
    title: 'Edit Monitor',
    bodyView: form
  })

  modal.on('shown', () => form.focus())

  modal.on('hidden', () => {
    form.remove()
    modal.remove()
  })

  form.on('submitted',() => modal.hide())

  modal.show()

  if (monitor.hasTemplate) {
    bootbox.alert({
      title: 'Warning',
      message: require('./template-warning.hbs')
    })
  }

  return modal
}
