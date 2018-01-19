import localforage from 'localforage'
import merge from 'lodash/merge'
const uuidv5 = require('uuid/v5')

const logger = require('lib/logger')('lib:handle-me')

export default class Handler {

  constructor () {

    const fingerprint = btoa(uuidv5('https://app.theeye.io', uuidv5.URL))

    this.fingerprint = fingerprint
    this.storage = null
    this.settings = null

    window[fingerprint] = this

  }

  initialize (next) {
    const storage = localforage.createInstance({
      name: 'theeye',
      storeName: 'me'
    })

    this.storage = storage
    storage
      .getItem(this.fingerprint)
      .then(settings => {

        if (!settings) {
          settings||(settings={})
          this.persist(settings)
        }

        this.settings = settings
        next(null,settings)
      })
  }

  persist (settings, next) {
    next||(next=()=>{})
    if (!this.storage) return

    let sets = merge({}, this.settings, settings)
    this.storage
      .setItem(this.fingerprint, sets)
      .catch(err => {
        debug('ERROR %j', err)
        next(err)
      })
      .then(() => {
        next()
      })
  }

  enableExperimentalFeatures () {
    this.persist({
      experimental: {
        enabled: true
      }
    }, (err) => {
      if (!err) {
        console.log('congrats! settings updated. refresh and enjoy')
      }
    })
  }

}
