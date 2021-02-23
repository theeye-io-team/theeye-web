
import App from 'ampersand-app'

// order matters
const credentials = ['viewer','user','manager','admin','owner','root']

export default {
  accessLevel (credential) {
    return credentials.indexOf(credential)
  },
  hasAccessLevel (required, options) {
    const credential = App.state.session.user.credential
    options||(options={})

    if (options.sameLevel) {
      return this.accessLevel(credential) == this.accessLevel(required)
    } else {
      return this.accessLevel(credential) >= this.accessLevel(required)
    }
  }
}
