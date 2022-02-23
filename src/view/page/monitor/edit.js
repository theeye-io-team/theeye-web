import Modalizer from 'components/modalizer'
import bootbox from 'bootbox'
import FormView from './form'

export default function (monitor) {
  const form = new FormView({ model: monitor })

  const modal = new Modalizer({
    buttons: false,
    title: `Edit monitor "${monitor.name}" [${monitor.id}]`,
    bodyView: form
  })

  //modal.on('shown', () => form.focus())

  modal.on('hidden', () => {
    form.remove()
    modal.remove()
  })

  form.on('submitted',() => modal.hide())

  modal.show()

  if (monitor.hasTemplate) {
    bootbox.alert({
      title: 'Warning',
      message: () => {
        let html = `<div>
          <p>Warning!</p>
          <p>You are customizing a monitor that belongs to a template,
            changes will be only applied to this monitor.</p>
          <p>Please update your template to make changes available for all.</p>
        </div>`
        return html
      }
    })
  }

  return modal
}
