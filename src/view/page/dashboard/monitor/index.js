import App from 'ampersand-app'
import View from 'ampersand-view'
import JobOutput from '../job-output'
import assign from 'lodash/assign'
import SearchActions from 'actions/searchbox'

const genericTypes = ['scraper','script','host','process','file']
const iconByType = {
  scraper: 'fa-cloud',
  script: 'fa-code',
  host: 'fa-server',
  process: 'fa-cog',
  file: 'fa-file-o',
  dstat: 'fa-bar-chart',
  psaux: 'fa-cogs'
}

/**
 * @summary turn string into hex color code
 *
 * https://stackoverflow.com/questions/3426404/create-a-hexadecimal-colour-based-on-a-string-with-javascript
 */
const str2rgb = (str) => {

  function hashCode(str) { // java String#hashCode
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return hash;
  } 

  function intToRGB(i){
    var c = (i & 0x00FFFFFF)
      .toString(16)
      .toUpperCase();

    return "00000".substring(0, 6 - c.length) + c;
  }

  return intToRGB(hashCode(str))

}

/**
 *
 * table row items for the collapsed content of the monitor rows.
 *
 */
const SubmonitorView = View.extend({
  template: require('./submonitor-row.hbs'),
  bindings: {
    'model.type': { hook: 'type' },
    'model.state': { hook: 'state' },
    'model.last_update_formatted': { hook: 'last_update_formatted' },
    'model.stateIcon': {
      type: 'class',
      hook: 'state-icon'
    },
    'model.hostname': { hook: 'hostname' }
  },
  events: {
    'click [data-hook=last_event]':'onClickLastEvent'
  },
  onClickLastEvent: function (event) {
    event.preventDefault();
    event.stopPropagation();

    const view = new JobOutput({ output: this.model.last_event || 'it is empty' })
    view.show()

    this.listenTo(this.model, 'change:last_event', () => {
      view.output = this.model.last_event
    })

    return false;
  },
  initialize:function(){
    View.prototype.initialize.apply(this,arguments)
    this.listenTo(this.model,'change:stateIcon',() => {
      this.trigger('change')
    })
  },
  render () {
    this.renderWithTemplate()
    this.stateIconEl = this.queryByHook('state-icon')
    this.$tooltip = $(this.stateIconEl)

    this.listenToAndRun(this.model,'change:state',this.updateTooltips)
  },
  updateTooltips () {
    this.stateIconEl.title = this.model.state
    this.stateIconEl.attributes.title = this.model.state
    this.$tooltip.tooltip('destroy')
    this.$tooltip.tooltip()
  }
})

/**
 * extend submonitors view, change table format and data with template.
 */
const SubmonitorGroupView = SubmonitorView.extend({
  template: require('./submonitor-group-row.hbs'),
  bindings: assign({}, SubmonitorView.prototype.bindings, {
    'model.name': { hook: 'name' },
    'model.hostname': { hook: 'hostname' }
  })
})

const MonitorButtonsView = View.extend({
  template: require('./monitor-row-buttons.hbs')
})

/**
 *
 * @summary single monitor row view. trigger events when the monitor state changes
 *
 */
const MonitorView = View.extend({
  template: require('./monitor-row.hbs'),
  props: {
    show: ['boolean',false,true]
  },
  bindings: {
    'model.type': {hook: 'type'},
    show: {
      type: 'toggle'
    }
  },
  events: {
    'click button[data-hook=search]':'onClickSearch',
    'click button[data-hook=workflow]':'onClickWorkflow',
    'click button[data-hook=stats]':'onClickStats',
    'click button[data-hook=edit]':'onClickEdit',
  },
  onClickSearch: function(event){
    event.stopPropagation();
    event.preventDefault();

    SearchActions.search(this.model.get('name'))

    return false;
  },
  onClickWorkflow: function(event){
    event.stopPropagation();
    event.preventDefault();

    window.location = '/admin/workflow?node=' + this.model.get('monitor').id

    return false;
  },
  onClickStats: function(event){
    event.stopPropagation();
    event.preventDefault();

    window.location = "/hoststats/" + this.model.get('host_id')

    return false;
  },
  onClickEdit: function(event){
    event.stopPropagation();
    event.preventDefault();

    window.location = "/admin/monitor#search=" + this.model.get('id')

    return false;
  },
  initialize: function () {
    View.prototype.initialize.apply(this,arguments)

    this.listenTo(this.model.submonitors,'change',this.checkMonitorsState)
  },
  checkMonitorsState: function () {
    var submonitors = this.model.get('submonitors');
    if (submonitors.length!==0) {
      const highSeverityMonitor = submonitors
        .reduce( (worstMonitor,monitor) => {
          if (!worstMonitor) return monitor;
          var m1 = monitor.stateOrder
          var m2 = worstMonitor.stateOrder
          return (m1>m2) ? monitor : worstMonitor;
        }, null )

      //this.stateIcon = highSeverityMonitor.stateIcon
      //this.state = highSeverityMonitor.get('state')
      var stateIconEl = this.queryByHook('state-icon')
      stateIconEl.className = highSeverityMonitor.stateIcon
      stateIconEl.title = highSeverityMonitor.state_severity

      this.trigger('change',this)
    } else {
      console.warn('this group of monitors is empty, there is nothing to show');
    }
  },
  setMonitorIcon: function () {
    var iconClass = 'circle fa'
    var color
    var type = this.model.get('type');

    const getIconByType = (type) => {
      const hit = iconByType[type]
      if (!hit) {
        return 'fa-circle'
      } else {
        return hit
      }
    }

    if (/^groupby-/.test(type) === true) {
      const parts = type.split('-')
      if (parts[1]==='hostname') {
        iconClass += ` fa-server`
        color = str2rgb(parts[2])
      }
      else if (parts[1]==='failure_severity') {
        iconClass += ` fa-fire severity-${parts[2].toLowerCase()}`
      }
      else if (parts[1]==='type') {
        iconClass += ` ${getIconByType(parts[2])} ${parts[2]}-color`
      }
    } else {
      iconClass += ` ${getIconByType(type)} ${type}-color`
    }

    const iconEl = this.query('h4[data-hook=monitor-icon] i')
    iconEl.className = iconClass
    if (color) {
      iconEl.style.backgroundColor = `#${color}`
    }
  },
  render: function(){
    this.renderWithTemplate()

    this.renderCollection(
      this.model.get('submonitors'),
      SubmonitorView,
      this.queryByHook('submonitors-container')
    )

    this.renderButtons()
    this.checkMonitorsState()
    this.setMonitorIcon()
  },
  renderButtons: function(){
    this.renderSubview(
      new MonitorButtonsView({ model: this.model }),
      this.query('div[data-hook=buttons-container]')
    )
    this.renderSubview(
      new MonitorButtonsView({ model: this.model }),
      this.query('ul.dropdown-menu[data-hook=buttons-container]')
    )
  }
})

/**
 * monitors grouped rows. this works when grouping is applied only
 */
const MonitorsGroupView = MonitorView.extend({
  render () {
    this.renderWithTemplate()

    // change collapsed content table headers
    const columnsTemplate = `
      <th></th>
      <th>Name</th>
      <th>Hostname</th>
      <th>Type</th>
      <th>Last Update</th>
      <th></th>
      `

    this.queryByHook('title-cols').innerHTML = columnsTemplate
    this.queryByHook('collapse-container').querySelector('h4').remove()
    this.queryByHook('monitor-icons-block').remove()

    this.renderCollection(
      this.model.get('submonitors'),
      SubmonitorGroupView,
      this.queryByHook('submonitors-container')
    )

    this.checkMonitorsState()
    this.setMonitorIcon()
  }
})

module.exports = function (options) {
  var model = options.model;
  if (/group/.test(model.type)) {
    return new MonitorsGroupView(options)
  } else {
    return new MonitorView(options)
  }
}
