import App from 'ampersand-app'

export default {
  hide () {
    App.state.iamMenu.visible = false
  },
  show () {
    let state = App.state.iamMenu
    if (!state.current_tab) {
      state.current_tab = state.default_tab
    }
    state.visible = true 
  },
  toggle () {
    App.state.iamMenu.toggle('visible')
  },
  toggleTab (tabName) {
    App.state.iamMenu.current_tab = tabName
  }
}
