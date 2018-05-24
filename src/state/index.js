import App from 'ampersand-app'
import AmpersandState from 'ampersand-state'
import Collection from 'ampersand-collection'
import uriFragment from 'lib/uri-fragment'
import { Collection as Webhooks } from 'models/webhook'
import { Collection as HostGroups } from 'models/hostgroup'
import { Collection as Users } from 'models/user'
import { Collection as Members } from 'models/member'
import { Collection as Customers } from 'models/customer'
import { Collection as Hosts } from 'models/host'
import { Collection as Schedules } from 'models/schedule'
import { Collection as Resources } from 'models/resource'
import { Collection as Tasks } from 'models/task'
import { Collection as Tags } from 'models/tag'
import { Collection as Scripts } from 'models/file/script'
import { Collection as Files } from 'models/file'
import { Collection as Events } from 'models/event'
import { Workflows } from 'models/workflow'
//import { EmitterCollection as Emitters } from 'models/event'
import { Collection as Notifications } from 'models/notification'
import Alerts from 'components/alerts'

import HostGroupPageState from './hostgroup-page'
import DashboardPageState from './dashboard-page'
import SessionState from './session'
import NavbarState from './navbar'
import HostStatsPageState from './hoststats-page'
import InboxState from './inbox'
import OnboardingState from './onboarding'
import ExtendedTagsState from './extended-tags'
import WorkflowPageState from './workflow-page'
import WorkflowVisualizerState from './workflow-visualizer'


const State = AmpersandState.extend({ extraProperties: 'allow' })

const credentials = [
  { order: 1, id: 'viewer', name: 'viewer', description: 'Viewer' },
  { order: 2, id: 'user', name: 'user', description: 'User' },
  { order: 3, id: 'manager', name: 'manager', description: 'Manager' },
  { order: 4, id: 'admin', name: 'admin', description: 'Admin' },
  { order: 5, id: 'owner', name: 'owner', description: 'Owner' }
]

const looptimes = [
  { id: 10000, text: '10 seconds' },
  { id: 15000, text: '0.25' },
  { id: 30000, text: '0.5' },
  { id: 60000, text: '1' },
  { id: 300000, text: '5' },
  { id: 900000, text: '15' },
  { id: 1800000, text: '30' },
  { id: 3600000, text: '60' }
]

const severities = [
  { id: 'LOW', text: 'LOW' },
  { id: 'HIGH', text: 'HIGH' },
  { id: 'CRITICAL', text: 'CRITICAL' }
]

const CredentialsCollection = Collection.extend({
  reset (models) {
    const reset = Collection.prototype.reset
    if (!models) {
      reset.call(this, credentials) // reset to original state
    } else {
      reset.call(this, models)
    }
  },
  clear () {
    this.reset([])
  }
})

const AppState = State.extend({
  //
  // BEWARE!! only use AppState.props to register
  // all the states we NEED to clear/reset when the App.state.reset method is called.
  // Do not include the session state, to avoid application auto logout
  //
  props: {
    activate: ['state',false,() => { return new ActivateState() }],
    passwordReset: ['state',false,() => { return new PasswordResetState() }],
    alerts: ['state',false,() => { return new Alerts() }],
    currentPage: 'state',
    dashboard: ['state',false,() => { return new DashboardPageState() }],
    hostGroupPage: ['state',false,() => { return new HostGroupPageState() }],
    login: ['state',false,() => { return new LoginState() }],
    notify: ['state',false,() => { return new NotifyState() }],
    register: ['state',false,() => { return new RegisterState() }],
    searchbox: ['state',false,() => { return new SearchBoxState() }],
    editor: ['state',false,() => { return new EditorState() }],
    onboarding: ['state', false, () => new OnboardingState()],
    hoststatsPage: ['state', true, () => new HostStatsPageState()],
    extendedTags: ['state', false, () => new ExtendedTagsState()],
    workflowPage: ['state', false, () => new WorkflowPageState()],
    workflowVisualizer: ['state', false, () => new WorkflowVisualizerState()]
  },
  initialize () {
    State.prototype.initialize.apply(this,arguments)

    // init empty collections
    _initCollections.call(this)

    App.loader.screenblock = true
    this.loader = App.loader

    this.session = new SessionState()
    this.navbar = new NavbarState()
    this.credentials = new CredentialsCollection()
    this.looptimes = new Collection(looptimes)
    this.severities = new Collection(severities)

    this.inbox = new InboxState({ appState: this })
  },
  appInit () {
    this.session.appInit()

    const resetCredentialsCollection = () => {
      if (this.session.logged_in===undefined) {
        return
      } else if (this.session.logged_in===false) {
        this.credentials.clear() // empty
      } else if (this.session.logged_in===true) {
        this.credentials.reset() // reset to default
      }
    }

    this.session.on('change:logged_in', resetCredentialsCollection)

    this.credentials.on('reset',() => {
      if (this.session.user.credential === 'root') {
        this.credentials.add({
          id: 'root',
          name: 'root',
          description: 'Root'
        })
      }
    })

    /**
     *
     * customer switch
     *
     */
    this.listenToAndRun(this.session.customer,'change:id', () => {
      if (!this.session.customer.id) return
      this.notifications.fetch({ reset: true })
    })
  },
  reset () {
    this.clear() // will reset all components state

    // call reset on every collections.
    // do not REPLACE REFERENCES! this will only reset to empty collections data
    Object.keys(this).forEach(prop => {
      let val = this[prop]
      if (val && val.isCollection) val.reset()
    })
  }
})

module.exports = AppState

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

const NotifyState = State.extend({
  props: {
    visible: ['boolean',false,false],
    message: 'string',
    badges: ['number',false,0] // notifications count
  }
})

const LoginState = State.extend({
  props: {
    showRecoverForm: ['boolean',false,false]
  }
})

const ActivateState = State.extend({
  props: {
    username: 'string',
    email: 'string',
    invitation_token: 'string',
    finalStep: ['boolean',false,false]
  }
})

const PasswordResetState = State.extend({
  props: {
    token: 'string'
  }
})

const RegisterState = State.extend({
  props: {
    result: ['boolean',false,false],
    message: ['string',false,'']
  }
})

const EditorState = State.extend({
  props: {
    value: ['string',false,'']
  }
})

const _initCollections = function () {
  Object.assign(this, {
    customers: new Customers([]),
    hostGroups: new HostGroups([]),
    hosts: new Hosts([]),
    hostsByRegex: new Hosts([]),
    resources: new Resources([]),
    schedules: new Schedules(),
    tasks: new Tasks([]),
    tags: new Tags([]),
    scripts: new Scripts([]),
    files: new Files([]),
    users: new Users([]),
    webhooks: new Webhooks([]),
    members: new Members([]),
    events: new Events([]),
    notifications: new Notifications([]),
    //emitters: new Emitters([]),
    workflows: new Workflows([])
  })

  //_syncEmitters.apply(this)
}

///**
// *
// * @todo improve this.
// *
// */
//const _syncEmitters = function () {
//  //const onCollectionEvent = (event, model, that, options) => {
//  const onCollectionEvent = () => {
//    let models = [].concat(
//      this.tasks.models,
//      this.webhooks.models,
//      this.resources.models
//    )
//    this.emitters.reset(models)
//  }
//
//  this.listenTo(this.tasks, 'all', onCollectionEvent)
//  this.listenTo(this.resources, 'all', onCollectionEvent)
//  this.listenTo(this.webhooks, 'all', onCollectionEvent)
//}
