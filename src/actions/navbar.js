import App from 'ampersand-app'

export default {
  toggleMenu () {
    // cambio la clase para que no se desarme el customer-name durante la animacion
    if (App.state.navbar.menuSwitch) {
      setTimeout(function(){ document.querySelector('.eyemenu-panel .eyemenu-secondary-users p.customer-name').style.whiteSpace = "normal" }, 200)
    } else {
      document.querySelector('.eyemenu-panel .eyemenu-secondary-users p.customer-name').style.whiteSpace = "nowrap"
    }
    App.state.navbar.toggle('menuSwitch')
  },
  toggleTopMenu () {
    App.state.navbar.toggle('topMenuSwitch')
    App.state.navbar.plusMenuSwitch = false
  },
  togglePlusMenu () {
    App.state.navbar.toggle('plusMenuSwitch')
    App.state.navbar.topMenuSwitch = false
  },
  setVisibility (visibility) {
    App.state.navbar.visible = visibility
  }
}
