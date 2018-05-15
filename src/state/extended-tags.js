import App from 'ampersand-app'
import State from 'ampersand-state'
import { Model as Tag, Collection as Tags } from 'models/tag'

export default State.extend({
  collections: {
    tags: Tags
  },
  initialize () {
    State.prototype.initialize.apply(this, arguments)
    var tags = this.tags

    const addTag = (model) => {
      if (!model.name) return

      let lcname = model.name.toLowerCase()
      let ctag = tags.get(lcname, 'name')
      if (!ctag) {
        let tag = new Tag({
          id: lcname,
          name: lcname,
          customer_id: model.customer_id
        })
        tags.add(tag, {merge: true})
      }
    }

    this.listenToAndRun(App.state.tags, 'add change sync reset', () => {
      App.state.tags.forEach(addTag)
    })

    this.listenToAndRun(App.state.tasks, 'add change sync reset', () => {
      App.state.tasks.forEach(addTag)
    })

    this.listenToAndRun(App.state.resources, 'add change sync reset', () => {
      App.state.resources.forEach(addTag)
    })
  }
})
