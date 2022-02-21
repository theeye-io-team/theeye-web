import AmpersandState from 'ampersand-state'
import localforage from 'localforage'

export default AmpersandState.extend({
  props: {
    monitorsGroupBy: ['object', true, () => ({prop: 'name'})],
    tasksGroupBy: ['object', true, () => ({prop: 'name'})],
    jobsListLength: ['number', false, 50]
  },
  session: {
    storage: 'object'
  },
  appInit () {
    this.storage = localforage.createInstance({
      driver: [localforage.INDEXEDDB, localforage.WEBSQL],
      name: 'theeye',
      storeName: 'localSettings'
    })

    this.on('change', this.syncWithStorage)

    return this.storage
      .getItem('localSettings')
      .then(settings => {
        if (!settings) {
          // first time here, set some settingss
          this.storage.setItem('localSettings', this.toJSON())
        } else {
          this.set(settings, { silent: true })
        }
        return settings
      })
      .catch(err => {
        console.error(err)
        return null
      })
  },
  syncWithStorage (state, newValue) {
    this.storage.setItem('localSettings', this.toJSON())
  }
})
