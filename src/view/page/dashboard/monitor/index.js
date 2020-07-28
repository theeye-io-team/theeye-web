import App from 'ampersand-app'
import View from 'ampersand-view'
import FilteredSubcollection from 'ampersand-filtered-subcollection'
import MonitorButtonsView from './buttons'
import * as MonitorConstants from 'constants/monitor'
import rowIconByType from '../row-icon-by-type'
import TagView from 'components/tag'
import HelpIconView from 'components/help-icon'
import { Factory as CollapseContentFactory } from './collapse-content'

export default function (options) {
  const model = options.model
  if ( /group/.test(model.type) ) {
    return new MonitorsGroupView(options)
  } else {
    return new MonitorViewFactory(options)
  }
}

/**
 *
 * @summary single monitor row view. trigger events when the monitor state changes
 *
 */
const MonitorView = View.extend({
  props: {
    show: ['boolean', false, true],
    hash: ['string', false, () => { return (new Date()).getTime() } ]
  },
  derived: {
    collapse_header_id: {
      deps: ['model.id'],
      fn () {
        return `collapse_header_${this.hash}_${this.model.id}`
      }
    },
    collapse_container_id: {
      deps: ['model.id'],
      fn () {
        return `collapse_container_${this.hash}_${this.model.id}`
      }
    },
    collapse_toggle_href: {
      deps: ['collapse_container_id'],
      fn () {
        return `#${this.collapse_container_id}`
      }
    },
    hostname: {
      deps: ['model.hostname'],
      fn () {
        return `(${this.model.hostname})` || '(Hostname not assigned)'
      }
    }
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
    hostname: {
      hook: 'hostname'
    },
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
        <div class="row-container panel panel-default">
          <div class="panel-heading" role="tab" data="panel-heading"> <!-- Collapse Heading Container { -->
            <h4 class="panel-title-icon">
              <i data-hook="row-icon"></i>
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

                  <span class="panel-item name">
                    <span data-hook="tags"></span>
                    <span data-hook="name"></span>
                    <span data-hook="help"></span>
                    <small> > <i data-hook="type"></i> <i data-hook="hostname"></i></small>
                  </span>

                  <section data-hook="buttons-block" style="float:right;">
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
                  <div class="panel-item tooltiped state-icon state-container">
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
    this.setRowIcon()
    this.renderCollapsedContent()
    this.renderTags()
    this.renderHelp()
  },
  renderHelp () {
    let icon = new HelpIconView({
      color: [255,255,255],
      category: 'task_row_help',
      text: this.model.description || 'Add Description'
    })

    this.renderSubview(icon, this.queryByHook('help'))

    this.listenTo(this.model, 'change:description', () => {
      icon.el.setAttribute('data-original-title', this.model.description)
    })
  },
  renderCollapsedContent () {
    this.renderSubview(
      new CollapseContentFactory({ model: this.model }),
      this.queryByHook('collapse-container-body')
    )

    // capture and handle collapse event
    $(this.queryByHook('collapse-container'))
      .on('show.bs.collapse', () => {
        App.actions.monitor.populate(this.model)
      })
  },
  setRowIcon () {
    var type = this.model.type;
    const attrs = rowIconByType(type)
    const iconEl = this.queryByHook('row-icon')
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
  renderTags () {
    if (this.model.tagsCollection) {
      this.renderCollection(
        this.model.tagsCollection,
        TagView,
        this.queryByHook('tags')
      )
    }
  }
})

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
  derived: {
    hostname: {
      deps: ['model.hostname'],
      fn () {
        return ''
      }
    }
  },
  initialize () {
    this.iconHook = 'group-state-icon'
    MonitorView.prototype.initialize.apply(this, arguments)
  },
  render () {
    this.renderWithTemplate()
    this.queryByHook('buttons-block').remove()

    this.renderCollection(
      this.model.submonitors,
      MonitorViewFactory,
      this.queryByHook('collapse-container-body')
    )

    this.setRowIcon()
  }
})



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

const HostMonitorGroupView = MonitorView.extend({
  render () {
    this.renderWithTemplate()
    this.renderCollapsedContent()
    this.renderButtons()
    this.setRowIcon()
    this.renderTags()
  },
  renderCollapsedContent () {
    // capture and handle collapse event
    $( this.queryByHook('collapse-container') ).on('show.bs.collapse', () => {
      App.actions.monitor.populate(this.model)
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

//const NestedMonitorView = MonitorView.extend({ })

function MonitorViewFactory (options) {
  const model = options.model;
  let monitor
  switch (model.type) {
    case MonitorConstants.TYPE_HOST:
      monitor = new HostMonitorGroupView(options)
      break;
    //case MonitorConstants.TYPE_NESTED:
    //  monitor = new NestedMonitorView(options)
    //  break;
    default:
      monitor = new MonitorView(options)
      break;
  }
  return monitor
}
