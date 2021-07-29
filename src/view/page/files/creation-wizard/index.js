import App from 'ampersand-app'
import View from 'ampersand-view'
import FileForm from 'view/page/files/form'
import { Model as FileModel } from 'models/file'
import Modalizer from 'components/modalizer'

export default View.extend({
  initialize() {
    const form = new FileForm({ model: new FileModel() })
    const modal = new Modalizer({
      buttons: false,
      title: this.title,
      bodyView: form
    })

    this.listenTo(modal, 'hidden', () => {
      form.remove()
      modal.remove()
    })
    form.on('submitted', () => modal.hide())
    modal.show()
    return modal
  }
})