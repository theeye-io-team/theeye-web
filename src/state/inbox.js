// import App from 'ampersand-app' // CANNOT BE USED HERE. IT IS NOT PRESENT UNTIL APP COMPLETE INITIALIZATION
import State from 'ampersand-state'
import { Collection as Notifications } from 'models/notification'
import FilteredSubcollection from 'lib/filtered-subcollection'

import notificationBadge from '../../assets/images/theeyeonly_medium.png'
import meaning from '../view/inbox/item/meaning'

export default State.extend({
  props: {
    appState: 'state',
    isOpen: ['boolean', false, false]
  },
  collections: {
    filteredNotifications: Notifications
  },
  initialize (options) {
    State.prototype.initialize.apply(this, arguments)

    this.filteredNotifications = new FilteredSubcollection(
      this.appState.notifications, {
        filters: buildFilterArray(this.appState),
        comparator: sortOnCreatedAt
      }
    )

    this.listenTo(
      this.appState.session.user.notifications,
      'change:desktopExcludes',
      this.updateFilters
    )

    this.listenTo(this.filteredNotifications, 'add', this.desktopNotification)
  },
  desktopNotification (notificationModel, collection) {
    if (!this.appState.session.user.notifications.desktop) return
    // no desktop for read notifications
    if (notificationModel.read) return
    // no support? no action
    if (!('Notification' in window)) return

    // if user has denied access, don't bother anymore
    if (window.Notification.permission === 'denied') return

    const notifOptions = {
      icon: notificationBadge,
      badge: notificationBadge,
      body: this.messageFactory(notificationModel.data)
    }
    const title = this.titleFactory(notificationModel.data)

    if (window.Notification.permission !== 'granted') {
      window.Notification.requestPermission(permission => {
        if (permission === 'granted') {
          new window.Notification(title, notifOptions)
        }
      })
    } else {
      new window.Notification(title, notifOptions)
    }
  },
  /**
   * author Martin Karadajian
   */
  titleFactory (data) {
    const type = data.model._type
    if (type === 'Resource') {
      return 'Resource ' + data.model.name
    } else if (/Job/.test(type) === true) {
      return 'Task ' + data.model.name
    } else {
      return ''
    }
  },
  messageFactory (data) {
    const type = data.model._type
    if (type === 'Resource') {
      let eventIndex = data.custom_event || data.monitor_event
      return meaning[eventIndex] || meaning[data.monitor_event]
    } else if (/Job/.test(type) === true) {
      let state = data.model.state.toLowerCase().replace(/ /g, '_')
      let lifecycle = data.model.lifecycle
      return meaning['lifecycle:' + lifecycle] || `${lifecycle}:${state}`
    } else {
      return data.model.state.toLowerCase().replace(/ /g, '_')
    }
  },
  updateFilters () {
    this.filteredNotifications.configure({
      comparator: sortOnCreatedAt,
      filters: buildFilterArray(this.appState)
    }, true)
  }
})

const sortOnCreatedAt = (model) => -model.createdAt

const buildFilterArray = (appState) => {
  const excludes = appState.session.user.notifications.desktopExcludes
  return excludes.map(filter => {
    return (model) => {
      // every prop has to match, including those in data
      let hasMatch = false
      for (let prop in filter) {
        if (prop === 'data') continue
        hasMatch = filter[prop] === model[prop]
      }

      // so far we know if 'topic' hasMatched with the one on filter
      let hasMatchingData = false
      if (filter.data) {
        // this is a super special case for notifications
        // filtered based on 'data' attribute
        for (let dataProp in filter.data) {
          hasMatchingData = model.data[dataProp] === filter.data[dataProp]
        }
      }
      // filters are exclusions, if matches, reject returning false
      return !(hasMatch && hasMatchingData)
    }
  })
}
