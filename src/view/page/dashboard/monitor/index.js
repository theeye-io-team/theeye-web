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
  derived: {
    isStats: {
      deps: ['model.type'],
      fn () {
        return this.model.type === 'dstat'
      }
    }
  },
  bindings: {
    'model.type': { hook: 'type' },
    'model.state': { hook: 'state' },
    'model.last_update_formatted': { hook: 'last_update_formatted' },
    'model.stateIcon': {
      type: 'class',
      hook: 'state-icon'
    },
    'model.hostname': { hook: 'hostname' },
    isStats: {
      type: 'toggle',
      hook: 'stats-button-container'
    }
  },
  events: {
    'click [data-hook=last_event]':'onClickLastEvent',
    'click button[data-hook=stats]':'onClickStats',
  },
  onClickLastEvent (event) {
    event.preventDefault();
    event.stopPropagation();

    const view = new JobOutput({ output: this.model.last_event || 'it is empty' })
    view.show()

    this.listenTo(this.model, 'change:last_event', () => {
      view.output = this.model.last_event
    })

    return false;
  },
  onClickStats (event) {
    event.stopPropagation();
    event.preventDefault();

    window.location = "/hoststats/" + this.model.host_id

    return false;
  },
  initialize () {
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
 * collapsed content for submonitors group
 */
const SubmonitorGroupView = SubmonitorView.extend({
  template: require('./submonitor-group-row.hbs'),
  bindings: assign({}, SubmonitorView.prototype.bindings, {
    'model.name': { hook: 'name' },
    'model.hostname': { hook: 'hostname' }
  })
})

const MonitorButtonsView = View.extend({
  template: require('./monitor-row-buttons.hbs'),
  events: {
    'click button[data-hook=search]':'onClickSearch',
    'click button[data-hook=workflow]':'onClickWorkflow',
    'click button[data-hook=edit]':'onClickEdit',
  },
  onClickSearch: function(event){
    event.stopPropagation();
    event.preventDefault();

    SearchActions.search(this.model.name)

    return false;
  },
  onClickWorkflow: function(event){
    event.stopPropagation();
    event.preventDefault();

    window.location = '/admin/workflow?node=' + this.model.monitor.id

    return false;
  },
  onClickEdit: function(event){
    event.stopPropagation();
    event.preventDefault();

    window.location = "/admin/monitor#search=" + this.model.id

    return false;
  },
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
    'model.hostname': {hook: 'hostname'},
    'model.type': {hook: 'type'},
    show: {
      type: 'toggle'
    }
  },
  initialize: function () {
    View.prototype.initialize.apply(this,arguments)

    this.listenTo(this.model.submonitors,'change',this.checkMonitorsState)
  },
  checkMonitorsState () {
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
      stateIconEl.title = highSeverityMonitor.state

      this.trigger('change',this)
    } else {
      console.warn('this group of monitors is empty, there is nothing to show');
    }
  },
  setMonitorIcon () {
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
      else { // use value first letter as icon
        let first = parts[2].replace(/[^A-Za-z0-9]/g, ' ').trim()[0].toLowerCase()
        iconClass += ` fa-letter fa-letter-${first}`
        color = str2rgb(parts[2])
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
  render (){
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
