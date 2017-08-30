import App from 'ampersand-app'
import View from 'ampersand-view'
import assign from 'lodash/assign'
import MonitorButtonsView from './buttons'

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

const higherSeverityMonitor = (submonitors) => {
  if (!submonitors||submonitors.length===0) return null
  return submonitors
    .reduce( (worstMonitor,monitor) => {
      if (!worstMonitor) return monitor;
      var m1 = monitor.stateOrder
      var m2 = worstMonitor.stateOrder
      return (m1>m2) ? monitor : worstMonitor;
    }, null )
}

const getMonitorIconAttributesByType = (type) => {
  var iconClass = 'circle fa'
  var bgcolor

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
      bgcolor = str2rgb(parts[2])
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
      bgcolor = str2rgb(parts[2])
    }
  } else {
    iconClass += ` ${getIconByType(type)} ${type}-color`
  }

  return {
    className: iconClass,
    style: {
      backgroundColor: `#${bgcolor}`
    }
  }
}

/**
 *
 * table row items for the collapsed content of the monitor rows.
 *
 */
//const SubmonitorView = View.extend({
//  template: require('./submonitor-row.hbs'),
//  derived: {
//    isStats: {
//      deps: ['model.type'],
//      fn () {
//        return this.model.type === 'dstat'
//      }
//    }
//  },
//  bindings: {
//    'model.type': { hook: 'type' },
//    'model.state': { hook: 'state' },
//    'model.last_update_formatted': { hook: 'last_update_formatted' },
//    'model.stateIcon': {
//      type: 'class',
//      hook: 'state-icon'
//    },
//    'model.hostname': { hook: 'hostname' },
//    isStats: {
//      type: 'toggle',
//      hook: 'stats-button-container'
//    }
//  },
//  initialize () {
//    View.prototype.initialize.apply(this,arguments)
//    this.listenTo(this.model,'change:stateIcon',() => {
//      this.trigger('change')
//    })
//  },
//  render () {
//    this.renderWithTemplate()
//    this.stateIconEl = this.queryByHook('state-icon')
//    this.$tooltip = $(this.stateIconEl)
//
//    this.listenToAndRun(this.model,'change:state',this.updateTooltips)
//  },
//  updateTooltips () {
//    this.stateIconEl.title = this.model.state
//    this.stateIconEl.attributes.title = this.model.state
//    this.$tooltip.tooltip('destroy')
//    this.$tooltip.tooltip()
//  }
//})

/**
 * extend submonitors view, change table format and data with template.
 * collapsed content for submonitors group
 */
//const SubmonitorGroupView = SubmonitorView.extend({
//  template: require('./submonitor-group-row.hbs'),
//  bindings: assign({}, SubmonitorView.prototype.bindings, {
//    'model.name': { hook: 'name' },
//    'model.hostname': { hook: 'hostname' }
//  })
//})


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
    'model.stateIcon': {
      type: 'class',
      hook: 'state-icon'
    },
    'model.state': {
      type: 'attribute',
      name: 'title',
      hook: 'state-icon'
    },
    show: {
      type: 'toggle'
    }
  },
  render (){
    this.renderWithTemplate()

    this.renderButtons()
    this.setMonitorIcon()
  },
  setMonitorIcon () {
    var type = this.model.type;

    const attrs = getMonitorIconAttributesByType(type)

    const iconEl = this.query('h4[data-hook=monitor-icon] i')
    iconEl.className = attrs.className
    if (attrs.style) {
      if (attrs.style.backgroundColor) {
        iconEl.style.backgroundColor = attrs.style.backgroundColor
      }
    }
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
  },
  checkMonitorsState () {
    const monitor = higherSeverityMonitor(this.model.submonitors)
    if (monitor!==null) {
      var stateIconEl = this.queryByHook('state-icon')
      stateIconEl.className = monitor.stateIcon
      stateIconEl.title = monitor.state
      this.trigger('change',{ monitor: monitor })
    } else {
      console.warn('this group of monitors is empty, there is nothing to show');
    }
  }
})

const HostMonitorView = MonitorView.extend({
  initialize () {
    View.prototype.initialize.apply(this,arguments)
    this.listenTo(this.model.submonitors,'change',this.checkMonitorsState)
  },
  render () {
    this.renderWithTemplate()

    //this.renderCollapsedTable()

    this.renderButtons()
    this.checkMonitorsState()
    this.setMonitorIcon()
  },
  //renderCollapsedTable () {
  //  const table = `
  //    <table class="table table-stripped">
  //      <thead>
  //        <tr data-hook="title-cols">
  //          <th></th>
  //          <th>Type</th>
  //          <th>Status</th>
  //          <th>Last updated</th>
  //          <th>Last Event</th>
  //          <th></th>
  //        </tr>
  //      </thead>
  //      <tbody> </tbody>
  //    </table>
  //    `
  //  const container = this.queryByHook('collapse-container-body')
  //  container.innerHTML = table
  //  this.renderCollection(
  //    this.model.submonitors,
  //    SubmonitorView,
  //    container.querySelector('tbody')
  //  )
  //}
})

/**
 * monitors grouped rows. this works when grouping is applied only
 */
const MonitorsGroupView = MonitorView.extend({
  initialize () {
    View.prototype.initialize.apply(this,arguments)
    this.listenTo(this.model.submonitors,'change',this.checkMonitorsState)
  },
  render () {
    this.renderWithTemplate()

    this.queryByHook('monitor-icons-block').remove()

    this.renderCollection(
      this.model.submonitors,
      MonitorView,
      this.queryByHook('collapse-container-body')
    )

    this.checkMonitorsState()
    this.setMonitorIcon()
  }
})

module.exports = function (options) {
  var model = options.model;

  if ( /group/.test(model.type) ) {
    return new MonitorsGroupView(options)
  } else {
    if (model.type === 'host') {
      return new HostMonitorView(options)
      //return new MonitorsGroupView(options)
    } else {
      return new MonitorView(options)
    }
  }
}
