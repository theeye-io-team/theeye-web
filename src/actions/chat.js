import App from 'ampersand-app'
import fcWidget from 'fcWidget'

module.exports = {
  init () {
    fcWidget.init(App.config.fcWidget)
    this.setUser()
  },
  setUser () {
    const user = App.state.session.user
    fcWidget.setExternalId(user.username)
    fcWidget.user.setFirstName(user.name)
    fcWidget.user.setEmail(user.email)
  },
  destroy () {
    fcWidget.destroy()
  }
}
