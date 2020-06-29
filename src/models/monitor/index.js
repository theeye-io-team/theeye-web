import App from 'ampersand-app'
import State from 'ampersand-state'
import AppCollection from 'lib/app-collection'
import config from 'config'
import * as MonitorConstants from 'constants/monitor'
import Schema from './schema'
import StateFactory from 'state/single-factory'

const BaseMonitor = Schema.extend({
  props: {
    resource_id: 'string',
    enable: 'boolean',
    creation_date: 'date',
    last_update: 'date',
    //config: ['object', false, () => { return {} }]
  },
  children: {
    template: Schema
  },
  serialize () {
    let attrs = Schema.prototype.serialize.apply(this, arguments)
    delete attrs.template
    return attrs
  }
})

// monitors with host
const HostedMonitor = BaseMonitor.extend({
  props: {
    host_id: 'string',
    template_id: 'string',
  },
  children: {
    host: function (attrs, options) {
      return new App.Models.Host.Model(attrs, options)
    }
  },
  parse (args) {
    // backwards compatibility. will eventually change
    if (args.config) {
      args = Object.assign({}, args, args.config)
    }
    return args
  },
  serialize () {
    let attrs = Schema.prototype.serialize.apply(this, arguments)

    if (attrs.host) {
      if (!attrs.host_id) {
        attrs.host_id = attrs.host.id
      }
    }

    // remove child state 'host'
    delete attrs.host
    return attrs
  }
})

//const NestedMonitorConfig = State.extend({
//  collections: {
//    monitors: function () {
//      const Col = App.Models.Resource.Collection
//      return new (Col.bind.apply(Col, arguments))([])
//    }
//  },
//  serialize () {
//    return { monitors: this.monitors.map(m => m.id) }
//  }
//})

const NestedMonitor = BaseMonitor.extend({
  initialize () {
    BaseMonitor.prototype.initialize.apply(this, arguments)
    this.type = MonitorConstants.TYPE_NESTED
    this._type = MonitorConstants.DISCRIMINATOR_TYPE_NESTED
  },
  props: {
    looptime: ['number', false, 0], // is not required
  },
  //children: {
  //  config: NestedMonitorConfig
  //},
  collections: {
    //monitors: function () {
    //  const Col = Collection
    //  return new (Col.bind.apply(Col, arguments))([])
    //}
    //monitors: function (models, options) {
    //  const Col = App.Models.Resource.Collection
    //  return new (Col.bind.apply(Col, arguments))([])
    //}
    monitors: function (models, options) {
      return new Collection(models, options)
    }
  },
  serialize () {
    const serialize = Schema.prototype.serialize
    let data = Object.assign({}, serialize.apply(this))
    //data.monitors = data.config.monitors
    data.monitors = data.monitors.map(m => m.id)
    delete data.config
    return data
  },
  parse () {
    let attrs = BaseMonitor.prototype.parse.apply(this, arguments)
    attrs.monitors = attrs.config.monitors
    return attrs
  }
})

const ScriptMonitor = HostedMonitor.extend({
  initialize () {
    HostedMonitor.prototype.initialize.apply(this, arguments)
    this.type = MonitorConstants.TYPE_SCRIPT
    this._type = MonitorConstants.DISCRIMINATOR_TYPE_SCRIPT
  },
  children: {
    script: function (attrs, options) {
      // module required on-demand
      //return new StateFactory(attrs, options)
      return new App.Models.Script.Model(attrs, options)
    }
  },
  props: {
    script_runas: 'string',
    script_id: 'string',
    script_arguments: ['array', false, () => { return [] }]
  }
})

const ScraperMonitor = HostedMonitor.extend({
  initialize () {
    HostedMonitor.prototype.initialize.apply(this, arguments)
    this.type = MonitorConstants.TYPE_SCRAPER
    this._type = MonitorConstants.DISCRIMINATOR_TYPE_SCRAPER
  },
  props: {
    pattern: 'string',
    parser: 'string',
    status_code: 'string',
    json: 'boolean',
    gzip: 'boolean',
    method: 'string',
    timeout: 'string',
    remote_url: 'string',
    headers: ['object', false, () => { return {} }],
    query: ['object', false, () => { return {} }],
    body: 'string',
  },
  parse () {
    let attrs = HostedMonitor.prototype.parse.apply(this, arguments)
    attrs.remote_url = attrs.url
    delete attrs.url
    return attrs
  },
  serialize () {
    let attrs = Schema.prototype.serialize.apply(this, arguments)
    attrs.url = attrs.remote_url
    return attrs
  }
})

const ProcessMonitor = HostedMonitor.extend({
  props: {
    raw_search: 'string',
    is_regexp: 'boolean',
    pattern: 'string',
    psargs: 'string'
  },
  initialize () {
    HostedMonitor.prototype.initialize.apply(this, arguments)
    this.type = MonitorConstants.TYPE_PROCESS
    this._type = MonitorConstants.DISCRIMINATOR_TYPE_PROCESS
  },
  parse (args) {
    // backwards compatibility. will eventually change
    if (args.config && args.config.ps) {
      args = Object.assign({}, args, args.config.ps)
    }
    return args
  },
})

const HealthMonitor = HostedMonitor.extend({
  initialize () {
    HostedMonitor.prototype.initialize.apply(this, arguments)
    this.type = MonitorConstants.TYPE_DSTAT
    this._type = MonitorConstants.DISCRIMINATOR_TYPE_DSTAT
  },
  props: {
    cpu: ['number', false, 70],
    mem: ['number', false, 70],
    cache: ['number', false, 70],
    disk: ['number', false, 70]
  },
  parse (args) {
    // backwards compatibility. will eventually change
    if (args.config && args.config.limit) {
      let config = args.config.limit
      args = Object.assign({}, args, {
        cache: Number(config.cache),
        mem: Number(config.mem),
        cpu: Number(config.cpu),
        disk: Number(config.disk) 
      })
    }
    return args
  },
})

const PsauxMonitor = HostedMonitor.extend({
  initialize () {
    HostedMonitor.prototype.initialize.apply(this, arguments)
    this.type = MonitorConstants.TYPE_PSAUX
    this._type = MonitorConstants.DISCRIMINATOR_TYPE_PSAUX
  }
})

const FileMonitor = HostedMonitor.extend({
  initialize () {
    HostedMonitor.prototype.initialize.apply(this, arguments)
    this.type = MonitorConstants.TYPE_FILE
    this._type = MonitorConstants.DISCRIMINATOR_TYPE_FILE
  },
  props: {
    permissions: 'string',
    os_groupname: 'string',
    os_username: 'string',
    dirname: 'string',
    basename: 'string',
    path: 'string',
    is_manual_path: 'boolean',
    file: 'string'
  }
})

const ModelsMapper = []
ModelsMapper[ MonitorConstants.TYPE_NESTED  ] = NestedMonitor
ModelsMapper[ MonitorConstants.TYPE_SCRIPT  ] = ScriptMonitor
ModelsMapper[ MonitorConstants.TYPE_SCRAPER ] = ScraperMonitor
ModelsMapper[ MonitorConstants.TYPE_PROCESS ] = ProcessMonitor
ModelsMapper[ MonitorConstants.TYPE_DSTAT   ] = HealthMonitor
ModelsMapper[ MonitorConstants.TYPE_PSAUX   ] = PsauxMonitor
ModelsMapper[ MonitorConstants.TYPE_FILE    ] = FileMonitor

export const Factory = function (attrs, options) {
  if (attrs && !attrs.type) {
    return new BaseMonitor(attrs, options)
  }

  let modelConstructor = ModelsMapper[attrs.type]
  if (!modelConstructor) {
    return new BaseMonitor(attrs, options)
  }

  return new modelConstructor(attrs, options)
}

export const Collection = AppCollection.extend({
  model: Factory,
  isModel (model) {
    let isModel = (
      model instanceof BaseMonitor ||
      model instanceof NestedMonitor ||
      model instanceof ScriptMonitor ||
      model instanceof ScraperMonitor ||
      model instanceof ProcessMonitor ||
      model instanceof HealthMonitor ||
      model instanceof PsauxMonitor ||
      model instanceof FileMonitor
    )

    return isModel
  }
})
