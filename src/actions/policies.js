import App from 'ampersand-app'
import { Model as Policy } from 'models/policy'

export default {
  create (data) {
    let policy = new Policy()
    policy.set(data)
    policy.save({},{
      collection: App.state.policies,
      success: function(){
        App.state.policies.add(policy)
      }
    });
  },
  update (id, data) {
    let policy = new Policy({ id: id })
    policy.set(data)
    policy.save({},{
      collection: App.state.policies,
      success: function(){
        App.state.policies.add(policy, {merge: true})
      }
    });
  }
}
