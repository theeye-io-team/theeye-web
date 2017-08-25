import AmpersandState from 'ampersand-state'
import AmpersandCollection from 'ampersand-collection'
import uriFragment from 'lib/uri-fragment'
import { Collection as Webhooks } from 'models/webhook'
import { Collection as HostGroups } from 'models/hostgroup'
import { Collection as Users } from 'models/user'
import { Collection as Customers } from 'models/customer'
import { Collection as Hosts } from 'models/host'
import { Collection as Schedules } from 'models/schedule'
import { Collection as Resources } from 'models/resource'
import { Collection as Tasks } from 'models/task'
import Alerts from 'components/alerts'
//import URI from 'urijs'

import HostGroupPageState from './hostgroup-page'
import DashboardPageState from './dashboard-page'
import SessionState from './session'

const State = AmpersandState.extend({ extraProperties: 'allow' })

const AppState = State.extend({
  props: {
    currentPage: 'state'
  }
})

module.exports = function (webType) {
  const SearchBoxState = State.extend({
    props: {
      search: ['string',false,'']
    },
    initialize () {
      State.prototype.initialize.apply(this,arguments)

      //const uri = new URI(window.location)
      //const fragment = uri.fragment()
      const fragment = uriFragment.get()

      if (fragment.search) {
        this.search = fragment.search
      }

      this.listenTo(this,'change:search',() => {
        uriFragment.set('search', this.search)
      })
    }
  })

  const LoaderState = State.extend({
    props: {
      visible: ['boolean',false,false],
      progress: ['number',false,0],
      message: ['string',false,'']
    }
  })

  const NotifyState = State.extend({
    props: {
      visible: ['boolean',false,false],
      message: 'string',
      badges: ['number',false,0] // notifications count
    }
  })

  const credentials = new AmpersandCollection([
    { id: 'viewer', name: 'viewer', description: 'Viewer' },
    { id: 'owner', name: 'owner', description: 'Owner' },
    { id: 'admin', name: 'admin', description: 'Admin' },
    { id: 'user', name: 'user', description: 'User' }
  ])

  const appState = new AppState({
    session: new SessionState(),
    alerts: new Alerts(),
    customers: new Customers([]),
    credentials: credentials,
    hosts: new Hosts([]),
    hostsByRegex: new Hosts([]),
    hostGroups: new HostGroups([]),
    hostGroupPage: new HostGroupPageState(),
    loader: new LoaderState(),
    notify: new NotifyState(),
    schedules: new Schedules(),
    users: new Users([]),
    webhooks: new Webhooks([]),
    resources: new Resources([]),
    tasks: new Tasks([]),
    dashboard: new DashboardPageState(),
    searchbox: new SearchBoxState()
  })

  credentials.listenTo(appState.session, 'change:ready', () => {
    if (appState.session.user.credential === 'root') {
      credentials.add({
        id: 'root',
        name: 'root',
        description: 'Root'
      })
    }
  })

  return appState
}
