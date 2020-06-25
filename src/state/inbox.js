import State from 'ampersand-state'
import { Collection as Notifications } from 'models/notification'
import FilteredSubcollection from 'lib/filtered-subcollection'

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
        comparator: sortOnCreationDate
      }
    )

    this.listenTo(
      this.appState.session.user.notifications,
      'change:notificationFilters',
      this.updateFilters
    )
  },
  updateFilters () {
    this.filteredNotifications.configure({
      comparator: sortOnCreationDate,
      filters: buildFilterArray(this.appState)
    }, true)
  }
})

const sortOnCreationDate = (model) => -model.creation_date

const buildFilterArray = (appState) => {
  const excludes = appState.session.user.notifications.notificationFilters
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
