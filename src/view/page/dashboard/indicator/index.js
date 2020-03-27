import App from 'ampersand-app'
import View from 'ampersand-view'
import ProgressBar from 'components/progress-bars'
import BaseView from 'view/base-view'
import Clipboard from 'clipboard'
import DismissIndicatorButton from './button/dismiss'
import TagView from 'components/tag'
//import EditIndicatorButton from './button/edit'

import './styles.less'

module.exports = function (options) {
  return new IndicatorRowView(options)
}

const IndicatorRowView = View.extend({
  initialize () {
    this.iconHook = this.iconHook || 'state-icon'

    this.template = `
      <div class="panel-row-container indicator-container">
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
                    <span class="panel-item name">
                      <span data-hook="tags"></span>
                      <span data-hook="name" title=""></span>
                      <small><i data-hook="type"></i></small>
                    </span>

                    <section data-hook="gauge-container" class="gauge-container"></section>
                  </div>

                  <section data-hook="buttons-block"></section>

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
    this.renderButtons()
    this.setRowIcon()
    this.renderGauges()
    this.renderCollapsedContent()
    this.renderTags()
  },
  renderTags () {
    if (this.model.tagsCollection) {
      this.renderCollection(
        this.model.tagsCollection,
        TagView,
        this.queryByHook('tags')
      )
    }
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
    // there is only one button.
    if (this.model.read_only===false) {
      let tpl = `
        <div class="panel-item icons dropdown">
          <button class="btn dropdown-toggle btn-primary"
            type="button"
            data-toggle="dropdown"
            aria-haspopup="true"
            aria-expanded="true">
            <i class="fa fa-ellipsis-v" aria-hidden="true"></i>
          </button>
          <ul data-hook="buttons-container" class="dropdown-menu"></ul>
        </div>
      `

      let block = this.queryByHook('buttons-block')
      block.innerHTML = tpl

      this.renderSubview(
        new DismissIndicatorButton({ model: this.model }),
        block.querySelector('ul')
      )
    }
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
  template: `
    <div class="indicator-details">
      <div class="row indicator-curl">
        <div class="col-xs-2">
          <label>Update CURL</label>
        </div>
        <div class="col-xs-10">
          <div class="">
            <button class="curl-copy btn btn-primary clip" type="button" data-hook="update-copy">
              <span class="glyphicon glyphicon-copy" alt="copy to clipboard"></span>
            </button>
            <div class="curl-container" data-hook="update-curl"></div>
          </div>
        </div>
      </div>
      <div class="row indicator-curl" style="padding-top:10px;">
        <div class="col-xs-2">
          <label>Delete CURL</label>
        </div>
        <div class="col-xs-10">
          <div class="">
            <button class="curl-copy btn btn-primary clip" type="button" data-hook="delete-copy">
              <span class="glyphicon glyphicon-copy" alt="copy to clipboard"></span>
            </button>
            <div class="curl-container" data-hook="delete-curl"></div>
          </div>
        </div>
      </div>
    </div>
  `,
  bindings: {
    //'updateCurl': {
    //  type: 'attribute',
    //  name: 'value',
    //  hook: 'update-curl'
    //},
    //'deleteCurl': {
    //  type: 'attribute',
    //  name: 'value',
    //  hook: 'delete-curl'
    //}
    'updateCurl': {
      hook: 'update-curl',
      type: 'innerHTML'
    },
    'deleteCurl': {
      hook: 'delete-curl',
      type: 'innerHTML'
    }
  },
  derived: {
    indicatorUrl: {
      deps: ['model.id'],
      fn () {
        const indicatorsURL = App.config.supervisor_api_url + '/indicator'
        let url = [
          "'",
          indicatorsURL,
          `/${this.model.id}`,
          '?access_token={access_token_here}&customer=',
          App.state.session.customer.name,
          "'"
        ]
        return url.join('')
      }
    },
    updateCurl: {
      deps: ['indicatorUrl','model.state'],
      fn () {
        let state = this.model.state==='normal'?'failure':'normal'
        let url = this.indicatorUrl
        let curl = [
          `curl -X PATCH ${url}`,
          ` --header 'Content-Type: application/json'`,
          ` --data '{"state":"${state}"}'`
        ]
        return curl.join('')
      }
    },
    deleteCurl: {
      deps: ['indicatorUrl'],
      fn () {
        let url = this.indicatorUrl
        return `curl -X DELETE ${url}`
      }
    }
  },
  render () {
    this.renderWithTemplate(this)

    new Clipboard(
      this.queryByHook('update-copy'),
      {
        text: () => this.updateCurl
      }
    )

    new Clipboard(
      this.queryByHook('delete-copy'),
      {
        text: () => this.deleteCurl
      }
    )
  }
})
