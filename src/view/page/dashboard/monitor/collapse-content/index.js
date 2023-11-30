import App from 'ampersand-app'
import View from 'ampersand-view'
import acls from 'lib/acls'
import * as lang2ext from 'lib/lang2ext'
import moment from 'moment'
import bootbox from 'bootbox'

import State from 'ampersand-state'
import Collection from 'ampersand-collection'
import * as MonitorConstants from 'constants/monitor'
import MonitorEdit from 'view/page/monitor/edit'

import './style.less'

const GenericCollapsedContent = View.extend({
  template: `<div>no definition</div>`,
  props: {
    monitor: 'state',
    resource: 'state'
  },
  bindings: {
    'monitor.host.hostname': { hook: 'hostname' },
    interval: { hook: 'interval' },
    description: { hook: 'description' },
    'monitor.name': { hook: 'name' },
  },
  derived: {
    interval: {
      deps: ['monitor.looptime'],
      fn () {
        const dur = moment.duration(this.monitor.looptime)
        const secs = dur.seconds()
        const mins = dur.minutes()

        if (!mins && !secs) return 'error'

        if (!mins) return `${secs} secs`
        if (!secs) return `${mins} mins`
        return `${mins} mins ${secs} secs`
      }
    },
    description: {
      deps: ['monitor.description'],
      fn () {
        return this.monitor.description || 'no details'
      }
    }
  }
})

const bindings = GenericCollapsedContent.prototype.bindings

const ScraperCollapsedContent = GenericCollapsedContent.extend({
  template: `
    <div class="task-container">
      <p><i data-hook="name"></i></p>
      <p>This monitor is executed on <i data-hook="hostname"></i> every <i data-hook="interval"></i></p>
      <i data-hook="description"></i>
      <h4>Request details</h4>
      <table class="table table-stripped">
        <thead>
          <tr data-hook="title-cols">
            <th></th>
            <th>URL</th>
            <th>Method</th>
            <th>Timeout</th>
            <th>Status Code</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td></td>
            <td><span data-hook="url"></span></td>
            <td><span data-hook="method"></span></td>
            <td><span data-hook="timeout"></span></td>
            <td><span data-hook="status_code"></span></td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
  props: {
    url: 'string',
    method: 'string',
    status_code: 'string',
  },
  bindings: Object.assign({}, bindings, {
    url: { hook: 'url' },
    method: { hook: 'method' },
    status_code: { hook: 'status_code' },
    timeout: { hook: 'timeout' },
  }),
  initialize () {
    GenericCollapsedContent.prototype.initialize.apply(this,arguments)
    this.listenToAndRun(this.monitor, 'change', this.updateState)
  },
  updateState () {
    this.url = this.monitor.remote_url
    this.method = this.monitor.method
    this.status_code = String(this.monitor.status_code)
  },
  derived: {
    timeout: {
      deps: ['monitor.timeout'],
      fn () {
        const time = this.monitor.timeout
        return (time / 1000) + ' s'
      }
    }
  }
})

const ProcessCollapsedContent = GenericCollapsedContent.extend({
  template: `
    <div class="task-container">
      <p><i data-hook="name"></i></p>
      <p>This monitor is executed on <i data-hook="hostname"></i> every <i data-hook="interval"></i></p>
      <i data-hook="description"></i>
      <h4>Process details</h4>
      <table class="table table-stripped">
        <thead>
          <tr data-hook="title-cols">
            <th>Is Regexp</th>
            <th>Search Pattern</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><span data-hook="is_regexp" class="fa"></span></td>
            <td><span data-hook="pattern"></span></td>
            <td><span data-hook="psargs"></span></td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
  bindings: Object.assign({}, bindings, {
    is_regexp: {
      hook: 'is_regexp',
      type: 'booleanClass',
      yes: 'fa-check-square-o',
      no: 'fa-square-o'
    },
    pattern: { hook: 'pattern' },
    psargs: { hook: 'psargs' }
  }),
  props: {
    is_regexp: 'boolean',
    pattern: 'string',
    psargs: 'string'
  },
  initialize () {
    GenericCollapsedContent.prototype.initialize.apply(this,arguments)
    this.listenToAndRun(this.monitor, 'change', this.updateState)
  },
  updateState () {
    this.is_regexp = this.monitor.is_regexp
    this.pattern = this.monitor.pattern
    this.psargs = this.monitor.psargs
  }
})

const ScriptCollapsedContent = GenericCollapsedContent.extend({
  template: `
    <div class="task-container">
      <p><i data-hook="name"></i></p>
      <p>This monitor is executed on <i data-hook="hostname"></i> every <i data-hook="interval"></i></p>
      <i data-hook="description"></i>
      <h4>Script details</h4>
      <table class="table table-stripped">
        <thead>
          <tr data-hook="title-cols">
            <th></th>
            <th>Description</th>
            <th>Filename</th>
            <th>Type</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td></td>
            <td><span data-hook="script_description"></span></td>
            <td><span data-hook="script_filename"></span></td>
            <td><span data-hook="script_language"></span></td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
  events: {
    'click button[data-hook=edit_script]': 'onClickEditScript'
  },
  onClickEditScript (event) {
    event.preventDefault()
    event.stopPropagation()

    if (!this.script_id) return

    App.actions.file.edit(this.script_id)

    return false
  },
  initialize () {
    GenericCollapsedContent.prototype.initialize.apply(this,arguments)
    this.listenToAndRun(this.monitor.script, 'change', this.updateState)
  },
  updateState () {
    let script = this.monitor.script
    this.script_id = script.id
    this.extension = script.extension
    this.filename = script.filename
    this.description = script.description
  },
  props: {
    extension: 'string',
    filename: 'string',
    description: 'string',
    script_id: 'string'
  },
  derived: {
    formatted_description: {
      deps: ['monitor.description'],
      fn () {
        return this.monitor.description || 'no details'
      }
    },
    language: {
      deps: ['extension'],
      fn () {
        return lang2ext.langFor[this.extension]
      }
    },
  },
  bindings: Object.assign({}, bindings, {
    formatted_description: { hook: 'description' },
    filename: { hook: 'script_filename' },
    language: { hook: 'script_language' },
    description: { hook: 'script_description' },
    // disable button when not available
    script_id: {
      hook: 'edit_script',
      type: 'booleanAttribute',
      name: 'disabled',
      invert: true
    }
  }),
  render () {
    this.renderWithTemplate(this)
    if (acls.hasAccessLevel('admin')) {
      this.query('tbody tr').innerHTML += `<td><button title="Edit the script" data-hook="edit_script" class="fa fa-edit btn btn-sm btn-primary"></button></td>`
    }
  }
})

const FileCollapsedContent = GenericCollapsedContent.extend({
  template: `
    <div class="task-container">
      <p><i data-hook="name"></i></p>
      <p>This monitor is executed on <i data-hook="hostname"></i> every <i data-hook="interval"></i></p>
      <i data-hook="description"></i>
      <h4>File details</h4>
      <table class="table table-stripped">
        <thead>
          <tr data-hook="title-cols">
            <th></th>
            <th>Directory</th>
            <th>Filename</th>
            <th>Username</th>
            <th>Groupname</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td></td>
            <td><span data-hook="dirname"></span></td>
            <td><span data-hook="basename"></span></td>
            <td><span data-hook="os_username"></span></td>
            <td><span data-hook="os_groupname"></span></td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
  bindings: Object.assign({}, bindings, {
    dirname: { hook: 'dirname' },
    basename: { hook: 'basename' },
    os_username: { hook: 'os_username' },
    os_groupname: { hook: 'os_groupname' },
    file_id: {
      hook: 'edit_file',
      type: 'booleanAttribute',
      name: 'disabled',
      invert: true
    }
  }),
  props: {
    dirname: 'string',
    basename: 'string',
    os_username: 'string',
    os_groupname: 'string',
    file_id: 'string'
  },
  initialize () {
    GenericCollapsedContent.prototype.initialize.apply(this,arguments)

    this.listenToAndRun(this.monitor, 'change', this.updateState)
  },
  updateState () {
    let monitor = this.monitor
    this.file_id = monitor.file
    this.dirname = monitor.dirname
    this.basename = monitor.basename
    this.os_username = monitor.os_username || 'not specified'
    this.os_groupname = monitor.os_groupname || 'not specified'
  },
  events: {
    'click button[data-hook=edit_file]': 'onClickEditFile'
  },
  onClickEditFile (event) {
    event.preventDefault()
    event.stopPropagation()

    if (!this.file_id) return

    App.actions.file.edit(this.file_id)

    return false
  },
  render () {
    this.renderWithTemplate(this)
    if ( acls.hasAccessLevel('admin') ) {
      this.query('tbody tr').innerHTML += `<td><button title="Edit the script" data-hook="edit_file" class="fa fa-edit btn btn-sm btn-primary"></button></td>`
    }
  }
})

const HostCollapsedContent = GenericCollapsedContent.extend({
  template: `
    <div data-component="monitor-collapsed-content">
      <p>This is <i data-hook="hostname"></i> keep alive.</p>

      <div class="host_state col-md-12">
        <h4>
          <i class="fa theeye-robot-solid"></i>
          Host monitor state:
          <a href="#" data-hook="host_edit"><i class="fa fa-edit"></i></a>
          <i data-hook="host_state"></i>
        </h4>
      </div>

      <div class="psaux_state col-md-12">
        <section data-hook="psaux_state_section">
          <h4>
            <i class="fa fa-cogs"></i>
            Processes monitor state: 
            <a href="#" data-hook="psaux_edit"><i class="fa fa-edit"></i></a>
            <a href="#" data-hook="psaux_remove"><i class="fa fa-trash"></i></a>
            <i data-hook="psaux_state"></i>
          </h4>
        </section>
      </div>

      <div class="dstat_state col-md-12">
        <section data-hook="dstat_state_section">
          <h4>
            <i class="fa fa-bar-chart"></i>
            Health monitor state:
            <a href="#" data-hook="dstat_edit"><i class="fa fa-edit"></i></a>
            <a href="#" data-hook="dstat_remove"><i class="fa fa-trash"></i></a>
            <i data-hook="dstat_state"></i>
          </h4>

          <span>Host health values</span>
          <table class="table table-stripped">
            <thead>
              <tr data-hook="title-cols">
                <th></th>
                <th>CPU %</th>
                <th>Memory %</th>
                <th>Disk %</th>
                <th>Cache %</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td></td>
                <td><span data-hook="cpu"></span></td>
                <td><span data-hook="mem"></span></td>
                <td><span data-hook="disk" style="white-space: pre-line"></span></td>
                <td><span data-hook="cache"></span></td>
              </tr>
            </tbody>
          </table>
        </section>
      </div>
    </div>
  `,
  bindings: Object.assign({}, bindings, {
    'host.stateIcon': {
      hook: 'host_state',
      type: 'attribute',
      name: 'class'
    },
    'dstat': {
      hook: 'dstat_state_section',
      type: 'toggle'
    },
    'psaux': {
      hook: 'psaux_state_section',
      type: 'toggle'
    },
    'dstat.stateIcon': {
      hook: 'dstat_state',
      type: 'attribute',
      name: 'class'
    },
    'psaux.stateIcon': {
      hook: 'psaux_state',
      type: 'attribute',
      name: 'class'
    },
    dstat_cache: { hook: 'cache' },
    dstat_mem: { hook: 'mem' },
    dstat_cpu: { hook: 'cpu' },
    dstat_disk: { hook: 'disk' }
  }),
  props: {
    host: 'state',
    dstat: 'state',
    psaux: 'state',
    dstat_cache: 'string',
    dstat_mem: 'string',
    dstat_cpu: 'string',
    dstat_disk: 'string'
  },
  initialize () {
    GenericCollapsedContent.prototype.initialize.apply(this,arguments)
    this.listenToAndRun(this.monitor, 'change', this.updateState)

    if (this.dstat && this.dstat.monitor) {
      this.listenToAndRun(this.dstat.monitor, 'change', this.updateDstatState)
      this.listenToAndRun(this.dstat, 'change:last_event', this.updateDstatState)
    }
  },
  updateState () {
		
    return
  },
  updateDstatState () {
    const lastEvent = this.dstat.last_event
    if (!lastEvent || !lastEvent.data) {
      return
    }

    const data = lastEvent.data
    if (data.error) {
      console.warn('stats data error', data)
      return
    }

    let monitor = this.dstat.monitor

    if (data.disk) {
      var disksValue = ''
      for (let disk of data.disk) {
        disksValue = [
          disksValue,
          disk.name,
          ': ',
          String(Math.floor(disk.value)),
          ' / ',
          String(monitor.disk),
          "\n"
        ].join('')
      }
      this.dstat_disk = disksValue
    }

    if (data.cache || data.cache === 0) {
      this.dstat_cache = String(Math.floor(data.cache)) + ' / ' + String(monitor.cache)
    }

    if (data.cpu || data.cpu === 0) {
      this.dstat_cpu = String(Math.floor(data.cpu)) + ' / ' + String(monitor.cpu)
    }

    if (data.mem || data.mem === 0) {
      this.dstat_mem = String(Math.floor(data.mem)) + ' / ' + String(monitor.mem)
    }
  },
  events: {
    'click [data-hook=host_edit]':'editHostMonitor',
    'click [data-hook=dstat_edit]':'editDstatMonitor',
    'click [data-hook=psaux_edit]':'editPsauxMonitor',
    'click [data-hook=dstat_remove]':'removeDstatMonitor',
    'click [data-hook=psaux_remove]':'removePsauxMonitor'
  },
  editHostMonitor (event) {
    new MonitorEdit(this.host)
  },
  editDstatMonitor (event) {
    new MonitorEdit(this.dstat)
  },
  editPsauxMonitor (event) {
    new MonitorEdit(this.psaux)
  },
	removeDstatMonitor (event) {
		const msg = `${this.dstat.name} will be removed. Continue?`
		bootbox.confirm(msg, (confirmed) => {
			if (!confirmed) { return }
			App.actions.resource.remove(this.dstat.id)
		})
	},
  removePsauxMonitor (event) {
    const msg = `${this.psaux.name} will be removed. Continue?`
    bootbox.confirm(msg, (confirmed) => {
      if (!confirmed) { return }
      App.actions.resource.remove(this.psaux.id)
    })
  }
})

const NestedMonitorRowView = View.extend({
  template: `
    <tr>
      <td>
        <h4><i data-hook="name"></i></h4>
      </td>
      <td>
        <h4><i data-hook="hostname"></i></h4>
      </td>
      <td>
        <h4><i data-hook="state-icon"></i></h4>
      </td>
    </tr>
  `,
  bindings: {
    'model.name': { hook: 'name' },
    'model.hostname': { hook: 'hostname' },
    'model.stateIcon': {
      hook: 'state-icon',
      type: 'attribute',
      name: 'class'
    },
  }
})

const NestedCollapsedContent = GenericCollapsedContent.extend({
  template: `
    <div>
      <p>Nested Monitors</p>
      <table class="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Hostname</th>
            <th>State</th>
          </tr>
        </thead>
        <tbody data-hook="nested-monitors-container">
        </tbody>
      </table>
    </div>
  `,
  render () {
    this.renderWithTemplate(this)

    //let nestedMonitors = this.monitor.config.monitors
    let nestedMonitors = this.monitor.monitors
    this.renderCollection(
      nestedMonitors,
      NestedMonitorRowView,
      this.queryByHook('nested-monitors-container')
    )
  }
})

const CollapsedContentViewMap = []
CollapsedContentViewMap[ MonitorConstants.TYPE_SCRAPER ] = ScraperCollapsedContent
CollapsedContentViewMap[ MonitorConstants.TYPE_SCRIPT  ] = ScriptCollapsedContent
CollapsedContentViewMap[ MonitorConstants.TYPE_PROCESS ] = ProcessCollapsedContent
CollapsedContentViewMap[ MonitorConstants.TYPE_FILE    ] = FileCollapsedContent
CollapsedContentViewMap[ MonitorConstants.TYPE_HOST    ] = HostCollapsedContent
CollapsedContentViewMap[ MonitorConstants.TYPE_NESTED  ] = NestedCollapsedContent

function Factory (input) {
  const type = input.model.type

  // re-assign to internal properties
  const options = Object.assign({}, input, {
    resource: input.model,
    monitor: input.model.monitor
  })

  const CollapseView = CollapsedContentViewMap[type]
  if (CollapseView !== undefined) {
    return new CollapseView(options)
  } else {
    return new GenericCollapsedContent(options)
  }
}

export { HostCollapsedContent as HostContent, Factory }
