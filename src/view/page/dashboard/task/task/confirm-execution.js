import App from 'ampersand-app'
import View from 'ampersand-view'
import * as FieldsConstants from 'constants/field'

import './styles.less'

export default View.extend({
  template: `
    <div>
      <h2>You are going to run the task <b data-hook="name"></b>.</h2>
      <div class="row" data-hook="args-header">
        <div class="col-sm-3"><b>Label</b></div>
        <div class="col-sm-8"><b>Value</b></div>
      </div>
      <div data-hook="args-rows-container">
      </div>
      <br>
      <h2>Continue?</h2>
      <progress id="upload-progress" data-hook="upload-progress" max="100"></progress>
    </div>
  `,
  props: {
    name: ['string', false, ''],
    taskArgs: ['array', false, () => { return [] }],
    headerVisible: ['boolean', false, true],
    progress: ['integer', false, 0]
  },
  bindings: {
    'name': {
      type: 'text',
      hook: 'name'
    },
    'headerVisible': {
      type: 'toggle',
      hook: 'args-header'
    },
    'progress': {
      type: function (el, value) {
        el.value = value
      },
      hook: 'upload-progress'
    }
  },
  render () {
    this.renderWithTemplate(this)

    for (let arg of this.taskArgs) {
      const renderValue = getArgRenderValue(arg)
      const masked = (arg.type === FieldsConstants.TYPE_FIXED)

      const argRowView = new ArgRow({ renderValue, masked, label: arg.label })
      this.renderSubview(argRowView, this.queryByHook('args-rows-container'))
    }

    this.listenTo(App.state.progress, 'change:progress', () => {
      this.progress = App.state.progress.progress
    })
  },
  initialize (options) {
    App.state.progress.reset()
    if (options.taskArgs.length === 0) {
      this.headerVisible = false
    } else {
      this.headerVisible = true
    }
  }
})

const getArgRenderValue = (arg) => {
  let renderValue, type = arg.type

  if (type === 'date') {
    if (Array.isArray(arg.value) && arg.value.length === 1) {
      return arg.value?.toString()
    }
  }

  if (type === 'file') {
    return arg.value?.name
  }

  if (typeof(arg.value) == "object") {
    return JSON.stringify(arg.value)
  }

  return arg.value
}

const ArgRow = View.extend({
  template: `
    <div class="row">
      <div class="col-sm-3" data-hook="label"></div>
      <div class="col-sm-8" data-hook="render-value"></div>
    </div>
  `,
  props: {
    label: ['string', false, ''],
    renderValue: ['string', false, ''],
    masked: ['boolean', false, false]
  },
  bindings: {
    label: {
      type: 'text',
      hook: 'label'
    },
    renderValue: {
      type: 'text',
      hook: 'render-value'
    },
    className: {
      hook: 'render-value',
      type: 'attribute',
      name: 'class'
    }
  },
  derived: {
    className: {
      deps: ['masked'],
      fn: function () {
        if (this.masked === true) {
          return 'col-sm-8 blurry-input blurry-text'
        } else {
          return 'col-sm-8'
        }
      }
    }
  },
  events: {
    'click .blurry-input': 'onCLickBlurry'
  },
  onCLickBlurry (event) {
    event.preventDefault()
    event.stopPropagation()
    $(event.target).toggleClass('blurry-text')
  },
  render () {
    this.renderWithTemplate(this)
  }
})
