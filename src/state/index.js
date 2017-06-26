import AmpersandState from 'ampersand-state'
import AmpersandCollection from 'ampersand-collection'
import { Collection as Webhooks } from 'models/webhook'
import { Collection as HostGroups } from 'models/hostgroup'
import { Collection as Users } from 'models/user'
import { Collection as Customers } from 'models/customer'
import { Collection as Hosts } from 'models/host'
import { Collection as Schedules } from 'models/schedule'

import HostGroupPageState from './hostgrouppage'

import Alerts from 'components/alerts'

const State = AmpersandState.extend({
  extraProperties: 'allow'
})

const AppState = State.extend({
  props: {
    currentSearch: 'any',
    currentPage: 'state'
  }
});

const Credentials = new AmpersandCollection([
  { id: 'viewer', name: 'viewer', description: 'Viewer' },
  { id: 'owner', name: 'owner', description: 'Owner' },
  { id: 'admin', name: 'admin', description: 'Admin' },
  { id: 'user', name: 'user', description: 'User' }
])

module.exports = function (webType) {
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

  return new AppState({
    alerts: new Alerts(),
    notify: new NotifyState(),
    loader: new LoaderState(),
    webhooks: new Webhooks([]),
    hostGroups: new HostGroups([]),
    hosts: new Hosts([]),
    users: new Users([]),
    customers: new Customers([]),
    schedules: new Schedules(),
    credentials: Credentials,
    hostGroupPage: new HostGroupPageState()
  })
}
