import App from 'ampersand-app'
import View from 'ampersand-view'
import assign from 'lodash/assign'
import MonitorButtonsView from './buttons'
import FilteredSubcollection from 'ampersand-filtered-subcollection'
import MonitorActions from 'actions/monitor'
const CollapseContentFactory = require('./collapse-content').Factory

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
 * @summary single monitor row view. trigger events when the monitor state changes
 *
 */
const MonitorView = View.extend({
  template: require('./monitor-row.hbs'),
  props: {
    show: ['boolean',false,true]
  },
  derived: {
    collapsedHeaderId: {
      deps: ['model.id'],
      fn () {
        return `collapse_heading_${this.model.id}`
      }
    },
    collapseContainerId: {
      deps: ['model.id'],
      fn () {
        return `collapse_container_${this.model.id}`
      }
    },
  },
  bindings: {
    'model.hostname': { hook: 'hostname' },
    'model.type': { hook: 'type' },
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
  render () {
    this.renderWithTemplate()
    this.renderButtons()
    this.setMonitorIcon()
    this.renderCollapsedContent()
  },
  renderCollapsedContent () {
    this.renderSubview(
      new CollapseContentFactory({ model: this.model }),
      this.queryByHook('collapse-container-body')
    )

    // capture and handle collapse event
    $( this.queryByHook('collapse-container') ).on('show.bs.collapse', () => {
      MonitorActions.populate(this.model.monitor)
    })
  },
  setMonitorIcon () {
    var type = this.model.type;
    const attrs = getMonitorIconAttributesByType(type)
    const iconEl = this.queryByHook('monitor-icon')
    iconEl.className = attrs.className
    if (attrs.style) {
      if (attrs.style.backgroundColor) {
        iconEl.style.backgroundColor = attrs.style.backgroundColor
      }
    }
  },
  renderButtons () {
    this.renderSubview(
      new MonitorButtonsView({ model: this.model }),
      this.query('div[data-hook=buttons-container]')
    )
    this.renderSubview(
      new MonitorButtonsView({ model: this.model }),
      this.query('ul.dropdown-menu[data-hook=buttons-container]')
    )
  },
})

const HostMonitorGroupView = MonitorView.extend({
  render () {
    this.renderWithTemplate()
    this.renderCollapsedContent()
    this.renderButtons()
    this.setMonitorIcon()
  },
  renderCollapsedContent () {

    // capture and handle collapse event
    $( this.queryByHook('collapse-container') ).on('show.bs.collapse', () => {
      MonitorActions.populate(this.model.monitor)
    })

    var monitors = this.model.submonitors.models.reduce((acum, item) => {
      acum[item.type] = item;
      return acum
    }, {})

    this.renderSubview(
      new CollapseContentFactory({
        host: monitors['host'],
        dstat: monitors['dstat'],
        psaux: monitors['psaux'],
        model: this.model
      }),
      this.queryByHook('collapse-container-body')
    )
  }
})

function MonitorViewFactory (options) {
  const model = options.model;
  if (model.type === 'host') {
    return new HostMonitorGroupView(options)
  } else {
    return new MonitorView(options)
  }
}

/**
 * monitors grouped rows. this works when grouping is applied only
 */
const MonitorsGroupView = MonitorView.extend({
  render () {
    this.renderWithTemplate()
    this.queryByHook('monitor-icons-block').remove()

    this.renderCollection(
      this.model.submonitors,
      MonitorViewFactory,
      this.queryByHook('collapse-container-body')
    )

    this.setMonitorIcon()
  }
})

module.exports = function (options) {
  const model = options.model
  if ( /group/.test(model.type) ) {
    return new MonitorsGroupView(options)
  } else {
    return new MonitorViewFactory(options)
  }
}
