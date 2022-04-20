import App from 'ampersand-app'
import { Model as Group } from 'models/group'

export default {
  create (data) {
    let group = new Group()
    group.set(data)
    group.save({},{
      collection: App.state.groups,
      success: function(){
        App.state.groups.add(group)
      }
    });
  },
  update (id, data) {
    let group = new Group({ id: id })
    group.set(data)
    group.save({},{
      collection: App.state.groups,
      success: function(){
        App.state.groups.add(group, {merge: true})
      }
    });
  }
}
