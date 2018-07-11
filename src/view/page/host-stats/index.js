import App from 'ampersand-app'
import AmpersandModel from 'ampersand-model'
import AmpersandCollection from 'ampersand-collection'
import View from 'ampersand-view'
import $ from 'jquery'
import each from 'lodash/each'
import debounce from 'lodash/debounce'
import './styles.less'

import NgrokIntegrationActions from 'actions/integrations/ngrok'

export default View.extend({
  template: `
    <div class="stats-container container-fluid">
      <div class="row">
        <div class="breadcrumbs col-xs-12">
          <a href="javascript:history.back()" class="back">
            <i class="fa fa-angle-left" aria-hidden="true"></i>
          </a>
          <i class="fa fa-bar-chart item-icon" aria-hidden="true"></i>
          <h4>Detailed Stats</h4>
        </div>
      </div>

      <div class="row">
        <div class="col-xs-12 col-md-6 stats-section">
          <div data-hook="host-container" class="stats-icon-container"> </div>
        </div>

        <div class="col-xs-12 col-md-6 stats-section">
          <div class="stats-icon-container">
            <span class="stats-icon">
              <i class="fa fa-bar-chart" aria-hidden="true"></i>
            </span>
            <h3>Resources Usage</h3>
          </div>
          <div data-hook="stat-graph-container" class="main-stats gray-zebra"> </div>
        </div>

        <div class="col-xs-12 col-md-6 stats-section">
          <div class="stats-icon-container">
            <span class="stats-icon">
              <i class="fa fa-puzzle-piece" aria-hidden="true"></i>
            </span>
            <h3>Host Interfaces</h3>
          </div>
          <div data-hook="interfaces-container"></div>
        </div>

        <div class="col-xs-12 col-md-6 stats-section">
          <div data-hook="processes-container"> </div>
        </div>
      </div>

    </div>
  `,
  props: {
    hostId: ['string', true],
    host: ['state'],
    resource: ['state'],
    dstat: ['object'],
    psaux: ['object']
  },
  initialize (options) {
    this.listenToAndRun(App.state.hoststatsPage, 'change:dstat', this.updateDstat)
    this.listenToAndRun(App.state.hoststatsPage, 'change:psaux', this.updatePsaux)

    this.on('change:host', () => {
      console.log('host reference changed')
      this.remove()
      this.render()
    })
  },
  updatePsaux: function () {
    this.psaux = App.state.hoststatsPage.psaux
    this.trigger('change:psaux')
  },
  updateDstat: function () {
    this.dstat = App.state.hoststatsPage.dstat
    this.trigger('change:dstat')
  },
  render: function () {
    this.renderWithTemplate(this)
    this.renderSubview(
      new HostView({
        parent: this,
        host: this.host,
        resource: this.resource
      }),
      this.queryByHook('host-container')
    )

    this.renderSubview(
      new GraphView({parent: this}),
      this.queryByHook('stat-graph-container')
    )

    this.renderSubview(
      new PsauxView({parent: this}),
      this.queryByHook('processes-container')
    )

    this.renderSubview(
      new IpsView({parent: this}),
      this.queryByHook('interfaces-container')
    )
  }
})

function getBlueToRed (percent) {
  var b = percent < 50 ? 255 : Math.floor(255 - (percent * 2 - 100) * 255 / 100)
  var r = percent > 50 ? 255 : Math.floor((percent * 2) * 150 / 100)
  return 'rgb(' + r + ', 0, ' + b + ')'
}

const VerticalBarView = View.extend({
  template: `
    <div class="pull-left">
      <div class="progress progress-bar-vertical">
        <div data-hook="percent" class="progress-bar">
          <span data-hook="percent_tag"></span>
        </div>
      </div>
      <span data-hook="tag" class="title"></span>
    </div>`,
  props: {
    percent: 'number',
    percent_tag: 'number',
    tag: 'string'
  },
  derived: {
    percentTag: {
      deps: ['percent_tag'],
      fn: function () {
        return this.percent_tag + ' %'
      }
    }
  },
  bindings: {
    percent: {
      type: function (el, value, previousValue) {
        el.style.height = value + '%'
        el.style.background = getBlueToRed(value)
      },
      hook: 'percent'
    },
    percentTag: {
      hook: 'percent_tag'
    },
    tag: {
      hook: 'tag'
    }
  }
})

const IpsEntry = AmpersandModel.extend({
  props: {
    name: 'string',
    receive: 'number',
    send: 'number'
  },
  idAttribute: 'name'
})
const IpsCollection = AmpersandCollection.extend({
  model: IpsEntry,
  mainIndex: 'name'
})
const IpsRowView = View.extend({
  template: `
    <tr>
      <td data-hook="name"></td>
      <td data-hook="receive"></td>
      <td data-hook="send"></td>
    </tr>`,
  bindings: {
    'model.name': {hook: 'name'},
    'model.receive': {hook: 'receive'},
    'model.send': {hook: 'send'}
  }
})
const IpsView = View.extend({
  template: `
    <table class="table">
      <thead>
        <tr>
          <th>Interface</th>
          <th>Receive</th>
          <th>Send</th>
        </tr>
      </thead>
      <tbody data-hook="items"></tbody>
    </table>`,
  props: {
    dstat: ['object', true, () => { return {} }]
  },
  initialize: function () {
    this.collection = new IpsCollection()
    this.listenToAndRun(this.parent, 'change:dstat', this.update)
  },
  update: function () {
    if (!this.parent.dstat) return
    this.dstat = this.parent.dstat
    const ips = this.dstat.stats && this.dstat.stats.net
    if (!ips) return

    this.collection.reset(Object.keys(ips).map(iface => {
      return new IpsEntry({
        name: iface,
        receive: ips[iface].receive,
        send: ips[iface].send
      })
    }))
  },
  render: function () {
    this.renderWithTemplate(this)

    this.renderCollection(
      this.collection,
      IpsRowView,
      this.queryByHook('items')
    )
  }
})

const GraphView = View.extend({
  props: {
    dstat: ['object', true, () => { return {} }]
  },
  template: '<div></div>',
  initialize: function (options) {
    this.listenToAndRun(this.parent, 'change:dstat', this.update)

    this.resizeHandler = this.progressBarWidth.bind(this)
    window.addEventListener('resize', this.resizeHandler)
  },
  remove: function () {
    View.prototype.remove.apply(this, arguments)
    window.removeEventListener('resize', this.resizeHandler)
  },
  update: function () {
    if (!this.parent.dstat) return
    this.dstat = this.parent.dstat
    this.render()
  },
  // resize bars event
  progressBarWidth: function (event) {
    var elems = this.$el.find('.pull-left')

    const value = this.$el.width() / elems.length
    const m = value * 0.3
    const w = Math.floor(value - m)
    elems.each(function (idx, bar) {
      var $bar = $(bar)

      var $progress = $bar.find('.progress-bar-vertical')
      $progress.width(w)
      $progress.css('margin', '0 ' + Math.floor(m / 2) + 'px')

      var $texts = $bar.find('span')
      if (w > 39) $texts.css('font-size', '14px')
      else if (w > 20) $texts.css('font-size', '12px')
      else $texts.css('font-size', '11px')
    })
  },
  render: function () {
    this.renderWithTemplate(this)
    this.$el = $(this.el)

    this.$el.empty()

    var stat = this.dstat.stats

    if (!stat) return

    const cpuValue = parseInt(100 - stat.cpu_idle)
    const memValue = parseInt(stat.mem_used * 100 / stat.mem_total)
    const cacheValue = parseInt((stat.cacheTotal - stat.cacheFree) * 100 / stat.cacheTotal)

    this.renderSubview(
      new VerticalBarView({
        percent: cpuValue,
        percent_tag: cpuValue,
        tag: 'CPU'
      })
    )

    this.renderSubview(
      new VerticalBarView({percent: memValue,
        percent_tag: memValue,
        tag: 'MEM'
      })
    )

    this.renderSubview(
      new VerticalBarView({percent: cacheValue,
        percent_tag: cacheValue,
        tag: 'CACHE'
      })
    )

    each(stat.disk, (disk, index) => {
      if (index !== 'total') {
        var diskValue = parseInt(disk.usage.used * 100 / disk.usage.total)
        this.renderSubview(
          new VerticalBarView({
            percent: diskValue,
            percent_tag: diskValue,
            tag: index.toUpperCase()
          })
        )
      }
    })

    this.progressBarWidth()
  }
})

const PsauxView = View.extend({
  template: `
    <div class="psaux-container">
      <!-- TITLE -->
      <div class="stats-icon-container">
        <span class="stats-icon">
          <i class="fa fa-cogs" aria-hidden="true"></i>
        </span>
        <h3>Host processes</h3>
      </div>
      <!-- //TITLE -->
      <div id="psaux-search">
        <form action="#" method="get">
          <div class="input-group">
            <!-- USE TWITTER TYPEAHEAD JSON WITH API TO SEARCH -->
            <input class="form-control" id="ps-search" name="q" placeholder="Search among server running processes" required>
            <span class="input-group-btn">
              <button type="submit" class="btn btn-default">
                <i class="fa fa-search"></i>
              </button>
            </span>
          </div>
        </form>
      </div>
      <div id="psaux-div">
        <table id="psaux-table" class="table table-responsive table-list-search">
          <thead>
            <tr>
              <th>username</th>
              <th>PID</th>
              <!-- the &nbsp; here is for avoiding wrapping -->
              <th data-sort="%cpu">%&nbsp;CPU</th>
              <th data-sort="%mem">%&nbsp;Mem</th>
              <th>VSZ</th>
              <th>RSS</th>
              <th>TTY</th>
              <th>State</th>
              <th>Started</th>
              <th>Time</th>
              <th>Command</th>
            </tr>
          </thead>
          <tbody data-hook="process-list"></tbody>
        </table>
      </div>
    </div>`,
  props: {
    psaux: 'object',
    config: 'object',
    filter: ['string', true, ''],
    sortOn: 'string',
    sortAsc: ['boolean', true, true],
    rows: ['array', true, () => []]
  },
  derived: {
    uiRows: {
      deps: ['rows', 'filter', 'sortOn', 'sortAsc'],
      fn: function () {
        return this.rows
          .filter(row => {
            return this.filter
              ? row.command.indexOf(this.filter.toLowerCase()) !== -1
              : true
          })
          .sort((a, b) => {
            return this.sortOn
              ? this.sortAsc
                ? a[this.sortOn] - b[this.sortOn]
                : b[this.sortOn] - a[this.sortOn]
              : 0
          })
      }
    }
  },
  initialize: function () {
    // onSocketConnected(function(){
    //   // connect and subscribe psaux notifications
    //   log('psaux listening socket updates');
    //   io.socket.on('psaux_update', psaux.update);
    // })
    this.listenToAndRun(this.parent, 'change:psaux', this.update)
  },
  events: {
    'click th[data-sort]': 'processSort',
    'keyup #ps-search': 'processFilterWrapper'
  },
  update: function () {
    this.set({psaux: this.parent.psaux})
    if (!this.psaux || !this.psaux.stats) return
    this.set({
      rows: this.psaux.stats.map(function (stat) {
        return {
          'user': stat['user'],
          'pid': stat['pid'],
          '%cpu': stat['%cpu'],
          '%mem': stat['%mem'],
          'vsz': stat['vsz'],
          'rss': stat['rss'],
          'tty': stat['tty'],
          'state': stat['state'],
          'started': stat['started'],
          'time': stat['time'],
          'command': stat['command']
        }
      })
    })
    this.renderRows()
  },
  processFilterWrapper: function (event) {
    // debounce for hostile filtering
    debounce(this.processFilter.bind(this), 300)()
  },
  processSort: function (event) {
    const newSort = event.target.dataset.sort
    if (this.sortOn === newSort) {
      this.toggle('sortAsc')
    } else {
      this.sortOn = newSort
      this.sortAsc = true
    }
    this.renderRows()
  },
  processFilter: function () {
    this.filter = this.$psauxSearchInput.val()
    this.renderRows()
  },
  renderRows: function () {
    if (!this.$el) return
    this.$psauxTbody.find('tr').remove()
    var $rows = this.uiRows.map(ps => {
      var $cols = []
      var $tr = $('<tr></tr>')
      for (var col in ps) {
        var $td = $('<td></td>')
        $td.html(ps[col])
        $cols.push($td)
      }
      $tr.append($cols)
      return $tr
    })
    this.$psauxTbody.append($rows)
  },
  render: function () {
    this.renderWithTemplate(this)
    this.$el = $(this.el)
    this.$psauxTbody = this.$el.find('#psaux-table tbody')
    this.$psauxSearchInput = this.$el.find('#ps-search')

    this.renderRows()
  }
})

const HostView = View.extend({
  template: `
    <div>
      <span class="stats-icon">
        <i class="fa fa-cloud" aria-hidden="true"></i>
      </span>
      <h3>Server</h3>
      <section data-hook="server">
        <span class="fa fa-server"></span> <i data-hook="name"></i>
        <br>
        Bot Version <small data-hook="agent_version"></small>
        <p>
          | <span data-hook="os_name"></span>
          | Bot
          <span>
            <b><i data-hook="state_message"></i></b>
          </span>
        </p>
        <br>Last Update <small data-hook="last_update"></small>
        <div data-hook="stat-load-container">
          <p>Load average :
            <span data-hook="load_average_1" class="loadAverage" id="lavg1"></span>,
            <span data-hook="load_average_5" class="loadAverage" id="lavg5"></span>,
            <span data-hook="load_average_15" class="loadAverage" id="lavg15"></span>
          </p>
        </div>
      </section>
      <section class="integrations">
        <br/>
        <h3>Integrations</h3>
        <div data-hook="integrations"></div>
      </section>
    </div>`,
  props: {
    host: ['state'],
    resource: ['state'],
    dstat: ['object'],
    psaux: ['object']
  },
  derived: {
    state_text: {
      deps: ['resource.state'],
      fn: function () {
        let text = 'state is unknown'
        switch (this.resource.state) {
          case 'updates_stopped':
            text = 'has stopped reporting updates'
            break
          case 'failure':
            text = 'is failing'
            break
          case 'normal':
            text = 'is reporting'
            break
        }
        return text
      }
    },
    state_color: {
      deps: ['resource.state'],
      fn: function () {
        let color = 'color: rgb(255,0,0);'
        switch (this.resource.state) {
          case 'updates_stopped':
            color = 'color: rgb(255,0,0);'
            break
          case 'failure':
            color = 'color: rgb(255,255,0);'
            break
          case 'normal':
            color = 'color: rgb(0,255,0);'
            break
        }
        return color
      }
    },
    load1minute: {
      deps: ['dstat'],
      fn: function () {
        return this.dstat && this.dstat.stats && this.dstat.stats.load_1_minute != null
          ? this.dstat.stats.load_1_minute.toFixed(2)
          : ''
      }
    },
    load5minute: {
      deps: ['dstat'],
      fn: function () {
        return this.dstat && this.dstat.stats && this.dstat.stats.load_5_minute != null
          ? this.dstat.stats.load_5_minute.toFixed(2)
          : ''
      }
    },
    load15minute: {
      deps: ['dstat'],
      fn: function () {
        return this.dstat && this.dstat.stats && this.dstat.stats.load_15_minute != null
          ? this.dstat.stats.load_15_minute.toFixed(2)
          : ''
      }
    }
  },
  bindings: {
    'host.hostname': {hook: 'name'},
    'host.agent_version': {hook: 'agent_version'},
    'host.os_name': {hook: 'os_name'},
    state_text: {hook: 'state_message'},
    state_color: {
      hook: 'state_message',
      type: 'attribute',
      name: 'style'
    },
    'resource.formatted_last_update': {hook: 'last_update'},
    load1minute: {hook: 'load_average_1'},
    load5minute: {hook: 'load_average_5'},
    load15minute: {hook: 'load_average_15'}
  },
  initialize: function () {
    this.listenToAndRun(this.parent, 'change:dstat', this.update)
  },
  update: function () {
    this.dstat = this.parent.dstat
  },
  render () {
    this.renderWithTemplate(this)

    this.renderIntegrations()
  },
  renderIntegrations () {
    let ngrok = App.state.session.customer.config.ngrok
    if (ngrok && ngrok.enabled === true) {
      let view = new NgrokIntegrationsView({
        model: this.host.integrations.ngrok,
        host: this.host
      })
      this.renderSubview(view, this.queryByHook('integrations'))
    }
  }
})

const NgrokIntegrationsView = View.extend({
  template: `
    <div class="ngrok">
      <div class="loading-overlay" data-hook="loading-overlay"> </div>
      <div class="ngrok-data">
        <div>Ngrok tunnel <span data-hook="ngrok-state"></span></div>
        <div>
          <i class="ngrok-switch fa" data-hook="ngrok-button"></i>
          <span data-hook="tunnel_url"></span>
          <span data-hook="ngrok_error"></span>
        </div>
      </div>
    </div>
  `,
  props: {
    host: 'state'
  },
  derived: {
    ngrok_switch: {
      deps: ['model.active'],
      fn () {
        return this.model.active
      }
    },
    ngrok_switch_html: {
      deps: ['model.active'],
      fn () {
        return this.model.active ? 'Stop' : 'Start'
      }
    },
    ngrok_state_html: {
      deps: ['model.active', 'model.last_job.inProgress'],
      fn () {
        if (this.model.last_job.inProgress) {
          return this.model.active ?
            ' shutting down...wait <i class="fa fa-spin fa-cog"></i>' :
            ' establishing tunnel...wait <i class="fa fa-spin fa-cog"></i>'
        }
        return this.model.active ? ' is established' : 'is down'
      }
    }
  },
  bindings: {
    'model.last_job.inProgress': {
      hook: 'loading-overlay',
      type: 'toggle'
    },
    ngrok_switch: [{
      hook: 'ngrok-button',
      type: 'booleanClass',
      yes: 'fa-stop',
      no: 'fa-play'
    }, {
      hook: 'ngrok-button',
      type: 'booleanClass',
      yes: 'red',
      no: 'green'
    }],
    ngrok_switch_html: {
      hook: 'ngrok-button',
      type: 'innerHTML'
    },
    ngrok_state_html: {
      hook: 'ngrok-state',
      type: 'innerHTML'
    },
    'model.tunnel_url': { hook: 'tunnel_url' },
    'model.ngrok_error': { hook: 'ngrok_error' },
  },
  events: {
    'click [data-hook=ngrok-button]': 'onClickNgrokButton',
    'click [data-hook=ngrok-settings]': function (event) {
      event.preventDefault()
      event.stopPropagation()
      App.state.navbar.settingsMenu.visible = true
      App.state.navbar.settingsMenu.current_tab = 'integrations'
    }
  },
  onClickNgrokButton (event) {
    if (this.model.active === true) {
      NgrokIntegrationActions.stopTunnel(this.host.id)
    } else {
      NgrokIntegrationActions.startTunnel(this.host.id)
    }
  }
})
