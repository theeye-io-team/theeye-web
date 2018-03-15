import App from 'ampersand-app'
import State from  'ampersand-state'
import { Model as Tag } from 'models/tag'
import { Collection as Tags } from 'models/tag'

export default State.extend({
  collections: {
    tags: Tags
  },
  initialize () {
    State.prototype.initialize.apply(this, arguments)
    var tags = this.tags

    this.listenToAndRun(App.state.tags,'add sync reset',() => {
      tags.add(App.state.tags.models, {merge: true})
    })

    this.listenToAndRun(App.state.tasks,'add change sync reset',() => {
      var tagList = []
      App.state.tags.forEach(tag => tagList.push(tag.name.toLowerCase()))
      App.state.tasks.forEach(task => {
        if (!task.name) return
        if (!tagList.includes(task.name.toLowerCase())) {
          var tag = new Tag({
            id: task.name,
            name: task.name,
            customer_id: task.customer_id
          })
          tags.add(tag, {merge: true})
        }
      })
    })

    this.listenToAndRun(App.state.resources,'add change sync reset',() => {
      var tagList = []
      App.state.tags.forEach(tag => tagList.push(tag.name.toLowerCase()))
      App.state.resources.forEach(resource => {
        if (!resource.name) return

        if (!tagList.includes(resource.name.toLowerCase())) {
          var tag = new Tag({
            id: resource.name,
            name: resource.name,
            customer_id: resource.customer_id
          })
          tags.add(tag, {merge: true})
        }
      })
    })
  }
})
