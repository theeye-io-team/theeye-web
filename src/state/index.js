import App from 'ampersand-app'
import AmpersandState from 'ampersand-state'
import Collection from 'ampersand-collection'
import { Collection as Indicators } from 'models/indicator'
import { Collection as Webhooks } from 'models/webhook'
import { Collection as HostGroups } from 'models/hostgroup'
import { Collection as Users } from 'models/user'
import { Collection as Members, AdminCollection as AdminMembers } from 'models/member'
import { Collection as Customers } from 'models/customer'
import { Collection as Hosts } from 'models/host'
import { Collection as Schedules } from 'models/schedule'
import { Collection as Resources } from 'models/resource'
import { Collection as Tasks } from 'models/task'
import { Collection as Jobs } from 'models/job'
import { Collection as Tags } from 'models/tag'
import { Collection as Files } from 'models/file'
import { Collection as Events } from 'models/event'
import { Workflows } from 'models/workflow'
import { Collection as Groups } from 'models/group'
//import { EmitterCollection as Emitters } from 'models/event'
import { Collection as Notifications } from 'models/notification'
import Alerts from 'components/alerts'

import * as IndicatorConstants from 'constants/indicator'
import * as TaskConstants from 'constants/task'

import TemplatePageState from './template-page'
import DashboardPageState from './dashboard-page'
import SessionState from './session'
import NavbarState from './navbar'
import SettingsMenuState from './settings-menu'
import GroupsMenuState from './groups'
import HostStatsPageState from './hoststats-page'
import InboxState from './inbox'
import OnboardingState from './onboarding'
import ExtendedTagsState from './extended-tags'
import WorkflowPageState from './workflow-page'
import WorkflowVisualizerState from './workflow-visualizer'
import LocalSettings from './local-settings'
import SearchBoxState from './searchbox'
import TabsState from './tabs'
import SideMenuState from './sideMenu'

const State = AmpersandState.extend({ extraProperties: 'allow' })

const ClearCollection = Collection.extend({
  initialize () {
    Collection.prototype.initialize.apply(this, arguments)
    this.reset()
  },
  reset (models) {
    const reset = Collection.prototype.reset
    if (!models) {
      reset.call(this, this.initialState) // reset to original state
    } else {
      reset.call(this, models)
    }
  },
  clear () {
    this.reset([])
  }
})

const CredentialsCollection = ClearCollection.extend({
  initialize () {
    this.initialState = [
      { order: 1, id: 'viewer', name: 'viewer', description: 'Viewer' },
      { order: 2, id: 'user', name: 'user', description: 'User' },
      { order: 3, id: 'manager', name: 'manager', description: 'Manager' },
      { order: 4, id: 'admin', name: 'admin', description: 'Admin' },
      { order: 5, id: 'owner', name: 'owner', description: 'Owner' }
    ]
    ClearCollection.prototype.initialize.apply(this, arguments)
  }
})

const LooptimesCollection = ClearCollection.extend({
  initialize () {
    this.initialState = [
      { pos:1, id: 10000, text: '10 seconds' },
      { pos:2, id: 15000, text: '15 seconds' },
      { pos:3, id: 30000, text: '30 seconds' },
      { pos:4, id: 60000, text: '60 seconds' },
      { pos:5, id: 90000, text: '90 seconds' },
      { pos:6, id: 300000, text: '5 minutes' },
      { pos:7, id: 900000, text: '15 minutes' },
      { pos:8, id: 1800000, text: '30 minutes' },
      { pos:9, id: 3600000, text: '60 minutes' }
    ]
    ClearCollection.prototype.initialize.apply(this, arguments)
  }
})

const IndicatorTypesCollection = ClearCollection.extend({
  initialize () {
    this.initialState = [
      { id: IndicatorConstants.TEXT_TYPE, text: 'Text' },
      { id: IndicatorConstants.PROGRESS_TYPE, text: 'Progress' },
      { id: IndicatorConstants.COUNTER_TYPE, text: 'Counter' },
      { id: IndicatorConstants.CHART_TYPE, text: 'Chart' }
    ]
    ClearCollection.prototype.initialize.apply(this, arguments)
  }
})

const SeveritiesCollection = ClearCollection.extend({
  initialize () {
    this.initialState = [
      { id: 'LOW', text: 'LOW' },
      { id: 'HIGH', text: 'HIGH' },
      { id: 'CRITICAL', text: 'CRITICAL' }
    ]
    ClearCollection.prototype.initialize.apply(this, arguments)
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
    hostGroupPage: ['state',false,() => { return new TemplatePageState() }],
    login: ['state',false,() => { return new LoginState() }],
    notify: ['state',false,() => { return new NotifyState() }],
    register: ['state',false,() => { return new RegisterState() }],
    editor: ['state',false,() => { return new EditorState() }],
    onboarding: ['state', false, () => new OnboardingState()],
    hoststatsPage: ['state', true, () => new HostStatsPageState()],
    extendedTags: ['state', false, () => new ExtendedTagsState()],
    workflowPage: ['state', false, () => new WorkflowPageState()],
    workflowVisualizer: ['state', false, () => new WorkflowVisualizerState()],
    onHold: ['state', false, () => new OnHoldState()],
    taskForm: ['state', false, () => new TaskFormState()],
    tabs: ['state', false, () => new TabsState()],
    enterprise: ['state', false, () => { return new EnterpriseState() }],
  },
  initialize () {
    State.prototype.initialize.apply(this,arguments)

    // init empty collections
    _initCollections.call(this)

    App.loader.screenblock = true
    this.loader = App.loader
    this.session = new SessionState()
    this.localSettings = new LocalSettings()
    this.navbar = new NavbarState()
    this.settingsMenu = new SettingsMenuState()
    this.groupsMenu = new GroupsMenuState()
    this.sideMenu = new SideMenuState()
    this.searchbox = new SearchBoxState()
    this.inbox = new InboxState({ appState: this })
    this.popup = new PopupState()
  },
  appInit () {
    this.localSettings.appInit()
      .then(() => {
        this.session.appInit()
      })

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
     * customer switch
     */
    this.listenToAndRun(this.session.customer, 'change:id', () => {
      if (!this.session.customer.id) { return }
      this.notifications.fetch({ reset: true })
    })
  },
  reset () {
    this.clear() // will reset all components state

    // reset collections.
    // this will call "reset" to empty the collections data and keep references
    Object.keys(this).forEach(prop => {
      let val = this[prop]
      if (val && val.isCollection) {
        val.reset()
      }
    })
  }
})

export default AppState

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

const OnHoldState = State.extend({
  props: {
    underExecution: ['boolean', false, false],
    newArrived: ['boolean', false, false],
    queue: ['array', false, () => { return [] }]
  }
})

const TaskFormState = State.extend({
  props: {
    file: 'object'
  }
})

const PopupState = State.extend({
  props: {
    visible: ['boolean', false, false],
    content: ['any', false, ''],
    title: ['string', false, 'TheEye Says:']
  }
})

const EnterpriseState = State.extend({
  props: {
    showEnterpriseForm: ['boolean',false,true]
  }
})

const _initCollections = function () {
  Object.assign(this, {
    hostGroups: new HostGroups([]),
    hosts: new Hosts([]),
    hostsByRegex: new Hosts([]),
    resources: new Resources([]),
    schedules: new Schedules(),
    tasks: new Tasks([]),
    jobs: new Jobs([]),
    tags: new Tags([]),
    files: new Files([]),
    webhooks: new Webhooks([]),
    indicators: new Indicators([]),
    members: new Members([]),
    events: new Events([]),
    notifications: new Notifications([]),
    workflows: new Workflows([]),
    groups: new Groups([]),
    admin: {
      users: new Users([]),
      customers: new Customers([]),
      members: new AdminMembers([])
    }
  })

  const runners = this.runners = new Collection([])
  this.credentials = new CredentialsCollection()
  this.looptimes = new LooptimesCollection()
  this.severities = new SeveritiesCollection()
  this.indicatorTypes = new IndicatorTypesCollection()

  const runnersAdd = (model) => {
    if (model.script_runas) {
      getHash(model.script_runas, hash => {
        runners.add({
          runner: model.script_runas,
          id: hash
        })
      })
    }
  }

  const runnersSync = (models) => {
    for (let model of models) {
      if (model.script_runas) {
        getHash(model.script_runas, hash => {
          runners.add({
            runner: model.script_runas,
            id: hash
          })
        })
      }
    }
  }

  // tasks
  this.tasks.on('change:script_runas add', runnersAdd)
  this.tasks.on('sync', (state) => {
    if (state.isCollection) {
      runnersSync(state.models)
    } else {
      runnersAdd(state)
    }
  })

  // monitors
  this.resources.on('change:script_runas add', runnersAdd)
  //this.resources.on('sync', runnersSync)
  this.resources.on('sync', (state) => {
    if (state.isCollection) {
      let monitors = state.models.map(resource => resource.monitor)
      runnersSync(monitors)
    } else {
      runnersAdd(state.monitor)
    }
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

const getHash = (data, cb) => {
  let encoded = new TextEncoder().encode(data)
  let digest = crypto.subtle.digest('SHA-1', encoded)
  digest.then(bytes => {
    let hash = Array
      .from(new Uint8Array(bytes))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
    cb(hash)
  })
}
