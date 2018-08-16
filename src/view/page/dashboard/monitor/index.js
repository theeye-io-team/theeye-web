import App from 'ampersand-app'
import View from 'ampersand-view'
import assign from 'lodash/assign'
import MonitorButtonsView from './buttons'
import FilteredSubcollection from 'ampersand-filtered-subcollection'
import MonitorActions from 'actions/monitor'
const CollapseContentFactory = require('./collapse-content').Factory
import MonitorConstants from 'constants/monitor'

//const genericTypes = ['scraper','script','host','process','file']
const iconByType = {
  //nested: 'fa-cubes',
  nested: 'fa-bullseye',
  scraper: 'fa-cloud',
  script: 'fa-code',
  host: 'theeye-robot-solid',
  process: 'fa-cog',
  file: 'fa-file-o',
  dstat: 'fa-bar-chart',
  psaux: 'fa-cogs'
}

const NO_TYPE_ICON_COLOR = '5bc4e8'

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
      iconClass += ` theeye-robot-solid`
      //bgcolor = str2rgb(parts[2])
      bgcolor = NO_TYPE_ICON_COLOR
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
      //bgcolor = str2rgb(parts[2])
      bgcolor = NO_TYPE_ICON_COLOR
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
  props: {
    show: ['boolean',false,true]
  },
  derived: {
    collapse_header_id: {
      deps: ['model.id'],
      fn () {
        return `collapse_header_${this.model.id}`
      }
    },
    collapse_container_id: {
      deps: ['model.id'],
      fn () {
        return `collapse_container_${this.model.id}`
      }
    },
    collapse_toggle_href: {
      deps: ['collapse_container_id'],
      fn () {
        return `#${this.collapse_container_id}`
      }
    },
  },
  bindings: {
    collapse_toggle_href: {
      hook: 'collapse-toggle',
      type: 'attribute',
      name: 'href'
    },
    collapse_header_id: [{
      hook: 'panel-heading',
      type: 'attribute',
      name: 'id'
    }, {
      hook: 'collapse-container',
      type: 'attribute',
      name: 'aria-labelledby'
    }],
    collapse_container_id: [{
      hook: 'collapse-toggle',
      type: 'attribute',
      name: 'aria-controls'
    }, {
      hook: 'collapse-container',
      type: 'attribute',
      name: 'id'
    }],
    'model.name': [
      { hook: 'name' },
      {
        type: 'attribute',
        name: 'title',
        hook: 'name'
      }
    ],
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
  initialize () {
    this.iconHook = this.iconHook || 'state-icon'

    this.template = `
      <div class="monitorRow">
        <div class="resource-container panel panel-default">
          <div class="panel-heading" role="tab" data="panel-heading"> <!-- Collapse Heading Container { -->
            <h4 class="panel-title-icon">
              <i data-hook="monitor-icon"></i>
            </h4>
            <h4 class="panel-title">
              <span class="collapsed"
                href="#unbinded"
                data-hook="collapse-toggle"
                data-toggle="collapse"
                data-parent="#monitor-accordion"
                aria-expanded="false"
                aria-controls="unbinded">
                <div class="panel-title-content">

                  <span class="panel-item name" data-hook="name">
                    <small><i data-hook="type"></i></small>
                  </span>

                  <section data-hook="monitor-icons-block" style="float:right;">
                    <div class="panel-item icons dropdown">
                      <button class="btn dropdown-toggle btn-primary"
                        type="button"
                        data-toggle="dropdown"
                        aria-haspopup="true"
                        aria-expanded="true">
                        <i class="fa fa-ellipsis-v" aria-hidden="true"></i>
                      </button>
                      <ul data-hook="buttons-container" class="dropdown-menu"> </ul>
                    </div>
                  </section>

                  <!-- state_severity is a model object derived property, not an attribute -->
                  <div class="panel-item tooltiped state-icon state-resource-container">
                    <span data-hook="${this.iconHook}"></span>
                  </div>

                </div>
              </span>
            </h4>
          </div> <!-- } END Collapse Heading Container -->
          <div class="panel-collapse collapse"
            data-hook="collapse-container"
            id="unbinded"
            role="tabpanel"
            aria-labelledby="unbinded">
            <div class="panel-body" data-hook="collapse-container-body"> </div>
          </div> <!-- Collapsed Content Container -->
        </div>
      </div>
    `
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
    $(this.queryByHook('collapse-container'))
      .on('show.bs.collapse', () => {
        MonitorActions.populate(this.model)
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
      MonitorActions.populate(this.model)
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

const NestedMonitorView = MonitorView.extend({
  render () {
    this.renderWithTemplate()
    this.renderCollapsedContent()
    this.renderButtons()
    this.setMonitorIcon()
  }
})

function MonitorViewFactory (options) {
  const model = options.model;
  let monitor
  switch (model.type) {
    case MonitorConstants.TYPE_HOST:
      monitor = new HostMonitorGroupView(options)
      break;
    case MonitorConstants.TYPE_NESTED:
      monitor = new NestedMonitorView(options)
      break;
    default:
      monitor = new MonitorView(options)
      break;
  }
  return monitor
}

/**
 * monitors grouped rows. this works when grouping is applied only
 */
const MonitorsGroupView = MonitorView.extend({
  bindings: Object.assign({}, MonitorView.prototype.bindings, {
    'model.stateIcon': {
      type: 'class',
      hook: 'group-state-icon'
    },
    'model.state': {
      type: 'attribute',
      name: 'title',
      hook: 'group-state-icon'
    },
  }),
  initialize () {
    this.iconHook = 'group-state-icon'
    MonitorView.prototype.initialize.apply(this, arguments)
  },
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
