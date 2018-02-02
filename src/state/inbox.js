import App from 'ampersand-app'
import State from  'ampersand-state'
import { Collection as Notifications } from 'models/notification'
import FilteredSubcollection from 'lib/filtered-subcollection'

export default State.extend({
  props: {
    isOpen: ['boolean',false,false]
  },
  collections: {
    filteredNotifications: Notifications
  },
  initialize () {
    State.prototype.initialize.apply(this,arguments)

    this.filteredNotifications = new FilteredSubcollection(
      App.state.notifications, {
        filters: buildFilterArray(),
        comparator: sortOnCreatedAt
      }
    )

    this.listenTo(
      App.state.session.user.notifications,
      'change:desktopExcludes',
      this.updateFilters
    )
  },
  updateFilters () {
    this.filteredNotifications.configure({
      comparator: sortOnCreatedAt,
      filters: buildFilterArray()
    }, true)
  },
})

const sortOnCreatedAt = (model) => -model.createdAt

const buildFilterArray = () => {
  const excludes = App.state.session.user.notifications.desktopExcludes
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