import App from 'ampersand-app'
export default {

  update (prop, value) {
    App.state.localSettings[prop] = value
  }

}
