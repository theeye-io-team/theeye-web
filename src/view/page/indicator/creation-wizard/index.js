import App from 'ampersand-app'
import FormView from '../form'
import Modalizer from 'components/modalizer'

export default function () {
  let model = new App.Models.Indicator.Indicator()
  let form = new FormView({ model })

  const modal = new Modalizer({
    buttons: false,
    title: 'Create Indicator',
    bodyView: form 
  })

  //this.listenTo(modal,'shown',() => { select.focus() })
  modal.on('hidden',() => {
    form.remove()
    modal.remove()
  })

  form.on('submitted',() => {
    modal.hide()
  })

  modal.show()
  modal.form = form
  modal.registerSubview(form)
  return modal
}
