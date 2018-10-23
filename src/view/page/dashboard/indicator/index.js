import App from 'ampersand-app'
import View from 'ampersand-view'
import ProgressBar from 'components/progress-bars'
import BaseView from 'view/base-view'
import Clipboard from 'clipboard'

import './styles.less'

module.exports = function (options) {
  return new IndicatorRowView(options)
}

const IndicatorRowView = View.extend({
  initialize () {
    this.iconHook = this.iconHook || 'state-icon'

    this.template = `
      <div class="panel-row-container">
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

                  <div class="panel-item-left">
                    <span class="panel-item name" data-hook="name">
                      <small><i data-hook="type"></i></small>
                    </span>

                    <section data-hook="gauge-container">
                    </section>
                  </div>

                  <div class="panel-item-right">
                    <section data-hook="buttons-block" style="float:right;">
                    </section>

                    <!-- state_severity is a model object derived property, not an attribute -->
                    <div class="panel-item tooltiped state-icon state-container">
                      <span data-hook="${this.iconHook}"></span>
                    </div>
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
            <div class="panel-body" data-hook="collapse-container-body">

            </div>
          </div> <!-- Collapsed Content Container -->
        </div>
      </div>
    `
  },
  props: {
    show: ['boolean', false, true]
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
    'model.title': [
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
  render () {
    this.renderWithTemplate()
    this.setRowIcon()
    this.renderGauges()
    this.renderCollapsedContent()
  },
  renderGauges () {
    this.renderSubview(
      new GaugesFactoryView({ model: this.model }),
      this.queryByHook('gauge-container')
    )
  },
  renderCollapsedContent () {
    this.renderSubview(
      new CollapsedContent({ model: this.model }),
      this.queryByHook('collapse-container-body')
    )
  },
  renderButtons () {
    let tpl = `
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
      `

    let block = this.queryByHook('buttons-block')
    block.innerHTML = tpl
  },
  setRowIcon () {
    const iconEl = this.queryByHook('row-icon')
    iconEl.className = 'fa fa-lightbulb-o circle'
    iconEl.style.backgroundColor = '#06D5B4'
  }
})

const GaugesFactoryView = function (options) {
  const model = options.model
  let gauge
  switch (model.type) {
    case 'text':
    case 'counter':
      gauge = new TextIndicatorView(options)
      break
    case 'progress':
      gauge = new ProgressIndicatorView(options)
      break
    default:
      gauge = new IndicatorView(options)
      break
  }
  return gauge
}

const ProgressIndicatorView = View.extend({
  template: `
    <div data-hook="progress-bar"></div>
  `,
  render () {
    this.renderWithTemplate()

    this.renderProgressBar()
  },
  renderProgressBar () {
    this.bars = this.renderSubview(
      new ProgressBar({ percent: this.model.value }),
      this.queryByHook('progress-bar')
    )

    this.model.on('change:value', () => {
      this.bars.percent = this.model.value
    })
  }
})

const TextIndicatorView = View.extend({
  template: `
    <div class="panel-item value" data-hook="value"></div>
  `,
  bindings: {
    'model.value': {
      type: 'text',
      hook: 'value'
    }
  }
})

const IndicatorView = View.extend({
  template: `
    <div class="panel-item value" data-hook="value"></div>
  `,
  bindings: {
    'model.value': {
      type: 'text',
      hook: 'value'
    }
  }
})

const CollapsedContent = BaseView.extend({
  template: require('./collapsed.hbs'),
  props: {
    updateCurl: ['string', false, ''],
    deleteCurl: ['string', false, '']
  },
  bindings: {
    'updateCurl': {
      type: 'attribute',
      name: 'value',
      hook: 'update-curl'
    },
    'deleteCurl': {
      type: 'attribute',
      name: 'value',
      hook: 'delete-curl'
    }
  },
  render () {
    this.renderWithTemplate(this)

    this.listenToAndRun(App.state.session.customer.tokens, 'sync', () => {
      this.setUpdateCurl()
      this.setDeleteCurl()
    })

    new Clipboard(this.query('.clipboard-update-btn'))
    new Clipboard(this.query('.clipboard-delete-btn'))
  },
  setUpdateCurl () {
    if (App.state.session.customer.tokens.models.length === 0) {
      this.updateCurl = ''
      return
    }

    let url = App.config.supervisor_api_url + '/indicator/' + this.model.id +
      '?access_token=' + App.state.session.customer.tokens.models[0].token +
      '&customer=' + App.state.session.customer.name

    let body = "{\\\"property\\\":\\\"value\\\"}"

    this.updateCurl = 'curl -X PATCH "' + url + '" --header "Content-Type: application/json" --data "' + body + '"'
  },
  setDeleteCurl () {
    if (App.state.session.customer.tokens.models.length === 0) {
      this.deleteCurl = ''
      return
    }

    let url = '"' + App.config.supervisor_api_url + '/indicator/' + this.model.id +
      '?access_token=' + App.state.session.customer.tokens.models[0].token +
      '&customer=' + App.state.session.customer.name + '"'
    this.deleteCurl = 'curl -X DELETE ' + url
  }
})
