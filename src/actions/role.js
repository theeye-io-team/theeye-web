import App from 'ampersand-app'
import * as IAM from 'models/iam'

export default {
  create (data) {
    const role = new IAM.Role()
    role.set(data)
    role.save({}, { collection: App.state.roles,
      //success () {
      //  App.state.policies.add(policy)
      //}
    })
  },
  update (id, data) {
    const role = new IAM.Role({ id })
    role.set(data)
    role.save({}, {
      collection: App.state.roles,
      //success: function(){
      //  App.state.policies.add(policy, {merge: true})
      //}
    })
  }
}
