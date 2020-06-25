import App from 'ampersand-app'

export default {
  hide () {
    App.state.popup.visible = false
  },
  show (content, title) {
    if (!App.state.popup.visible) {
      App.state.popup.title = title
      App.state.popup.content = content
      App.state.popup.visible = true
    }
  }
}
