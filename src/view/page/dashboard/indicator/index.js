import App from 'ampersand-app'
import View from 'ampersand-view'
import ProgressBar from 'components/progress-bars'
import TagView from 'components/tag'
import ButtonsMenu from './buttons-menu'
import * as IndicatorConstants from 'constants/indicator'
import DOMPurify from 'dompurify'
import FileView from 'components/file-view'
import ViewLoader from 'components/loader/view'

import './styles.less'

export default function (options) {
  return new IndicatorRowView(options)
}

const IndicatorRowView = View.extend({
  template: `
    <div data-component="indicators-page" class="panel-row-container indicator-container">
      <div class="row-container panel panel-default">
        <div class="panel-heading" role="tab" data="panel-heading">
          <h4 class="panel-title-icon">
            <i data-hook="row-icon"></i>
          </h4>
          <h4 class="panel-title">
            <section class="indicator-buttons" data-hook="buttons-block"></section>
            <div class="panel-title-content">
              <section class="indicator-title">
                <span data-hook="tags"></span>
                <span data-hook="name" title=""></span>
                <small><i data-hook="type"></i></small>
              </section>
              <section class="indicator-data" data-hook="data-container"></section>
            </div>
          </h4>
        </div>
      </div>
    </div>
  `,
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
  events: {
    'click [data-hook=launch-task]': (event) => {
      event.preventDefault()
      event.stopPropagation()

      App.actions.job.create(
        App.state.tasks.get(event.target.dataset.taskId),
        JSON.parse(event.target.dataset.taskArguments)
      )
    },
    'submit form': (event) => {
      event.preventDefault()
      event.stopPropagation()

      App.state.alerts.danger('Cannot do that')
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
    show: {
      type: 'toggle'
    }
  },
  render () {
    this.renderWithTemplate()
    this.renderButtons()
    this.setRowIcon()
    this.renderVisuals()
    //this.renderCollapsedContent()
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
  renderVisuals () {
    this.renderSubview(
      new VisualsFactoryView({ model: this.model }),
      this.queryByHook('data-container')
    )
  },
  //renderCollapsedContent () {
  //  this.renderSubview(
  //    new CollapsedContent({ model: this.model }),
  //    this.queryByHook('collapse-container-body')
  //  )
  //},
  renderButtons () {
    this.renderSubview(
      new ButtonsMenu({ model: this.model }),
      this.queryByHook('buttons-block')
    )

    this.renderSubview(
      new StateIconView({ model: this.model }),
      this.queryByHook('buttons-block')
    )
  },
  setRowIcon () {
    const iconEl = this.queryByHook('row-icon')
    iconEl.className = 'fa fa-lightbulb-o circle'
    iconEl.style.backgroundColor = '#06D5B4'
  }
})

const VisualsFactoryView = function (options) {
  const model = options.model
  let visual
  switch (model.type) {
    case IndicatorConstants.TEXT_TYPE_SHORT:
    case IndicatorConstants.HTML_TYPE_SHORT:
    case IndicatorConstants.COUNTER_TYPE_SHORT:
      visual = new TextIndicatorView(options)
      break
    case IndicatorConstants.PROGRESS_TYPE_SHORT:
      visual = new ProgressIndicatorView(options)
      break
    case IndicatorConstants.CHART_TYPE_SHORT:
      visual = new ChartIndicatorView(options)
      break
    case IndicatorConstants.FILE_TYPE_SHORT:
      visual = new FileIndicatorView(options)
      break
    default:
      visual = new IndicatorView(options)
      break
  }
  return visual
}

const ProgressIndicatorView = ProgressBar.extend({
  initialize () {
    ProgressBar.prototype.initialize.apply(this, arguments)

    this.listenToAndRun(this.model, 'change:value change:state change:severity', () => {
      this.updateState()
    })
  },
  updateState () {
    let color
    if (this.model.state === 'normal') {
      color = "#50D841"
    } else {
      const lcseverity = this.model.severity.toLowerCase()
      switch (lcseverity) {
        case "low":
          color = "#FFE400"
          break;
        case "high":
          color = "#FF8640"
          break;
        case "critical":
          color = "#FF4D4D"
          break
        default:
          console.warn('ProgressBar Indicator color cannot be determined')
          break;
      }
    }

    this.color = color
    this.percent = this.model.value
  }
})

const ChartIndicatorView = View.extend({
  template: `
    <div class="panel-item value" data-hook="value">
      <button style="width:200px;" class="btn btn-primary" data-hook="render-plot">Load a plot preview</button>
    </div>
  `,
  events: {
    'click button[data-hook=render-plot]': 'renderPlot'
  },
  renderPlot (event) {
    const button = this.query('button')
    button.innerHTML = '<span><i class="fa fa-spin fa-cog"></i></span>'

    const loader = new ViewLoader(this)
    loader.start()
    import(/* webpackChunkName: "plotly-js.dist" */ 'plotly.js-dist')
      .then(({ default: Plotly }) => {

        button.remove()
        loader.stop()
        const layout = {
          height: 400,
          width: 500,
          grid: { rows: 2, columns: 2 }
        }

        const value = this.model.value
        Plotly.newPlot(this.el, value.data, layout)
      })
  }
})

const TextIndicatorView = View.extend({
  template: `
    <div class="panel-item value" data-hook="value"></div>
  `,
  derived: {
    html: {
      deps: ['model.value'],
      fn () {
        return DOMPurify.sanitize(this.model.value)
      }
    }
  },
  bindings: {
    html: {
      type: 'innerHTML',
      hook: 'value'
    }
  }
})

const FileIndicatorView = View.extend({
  template: `<div class="panel-item value" data-hook="value"></div>`,
  render () {
    this.renderWithTemplate()

    const fileView = new FileView({
      file: this.model.value,
      title: this.model.title
    })
    this.renderSubview(fileView, this.el)
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

const StateIconView = View.extend({
  template: `
    <div class="panel-item tooltiped state-icon state-container">
      <span data-hook="state-icon"></span>
    </div>
  `,
  bindings: {
    'model.stateIcon': {
      type: 'class',
      hook: 'state-icon'
    },
    'model.state': {
      type: 'attribute',
      name: 'title',
      hook: 'state-icon'
    }
  }
})
