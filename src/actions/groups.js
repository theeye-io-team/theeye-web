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
  },
  remove (id) {
    const group = new App.Models.Group.Model({ id })
    if (!group) return
    App.state.loader.visible = true
    group.destroy({
      success () {
        App.state.loader.visible = false
        App.state.alerts.info('success')
        App.state.groups.remove(group)
      },
      error (err) {
        App.state.loader.visible = false
        App.state.alerts.danger('Group removal failed')
      }
    })
  }
}
