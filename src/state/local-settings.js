import AmpersandState from 'ampersand-state'
import localForage from 'localforage'

module.exports = AmpersandState.extend({
  props: {
    monitorsGroupBy: ['object', true, () => ({prop: 'name'})],
    tasksGroupBy: ['object', true, () => ({prop: 'name'})]
  },
  session: {
    storage: 'object'
  },
  appInit () {
    this.storage = localForage.createInstance({
      name: 'theeye',
      storeName: 'localSettings'
    })

    this.on('change', this.syncWithStorage)

    return this.storage.ready()
      .then(() => this.storage.getItem('localSettings'))
      .then(value => {
        if (!value) {
          // first time here, set some values
          this.storage.setItem('localSettings', this.toJSON())
        } else {
          this.set(value, {silent: true})
        }
        return value
      })
  },
  syncWithStorage (state, newValue) {
    this.storage.setItem('localSettings', this.toJSON())
  }
})
