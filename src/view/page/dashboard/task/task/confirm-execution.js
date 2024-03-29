import View from 'ampersand-view'
import * as FieldsConstants from 'constants/field'

export default View.extend({
  template () {
    const message = `
      <div>
        <h2>You are going to ${this.message}</h2>
        <div class="row" data-hook="args-header">
          <div class="col-sm-3"><b>Label</b></div>
          <div class="col-sm-8"><b>Value</b></div>
        </div>
        <div data-hook="args-rows-container">
        </div>
        <br>
        <h2>Continue?</h2>
      </div>
    `
    return message
  },
  props: {
    message: 'string',
    taskArgs: ['array', false, () => { return [] }],
    headerVisible: ['boolean', false, true]
  },
  bindings: {
    'headerVisible': {
      type: 'toggle',
      hook: 'args-header'
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
  },
  initialize (options) {
    if (options.taskArgs.length === 0) {
      this.headerVisible = false
    } else {
      this.headerVisible = true
    }
  }
})

const getArgRenderValue = (arg) => {
  let renderValue, type = arg.type

  if (type === FieldsConstants.TYPE_DATE) {
    if (Array.isArray(arg.value) && arg.value.length === 1) {
      return arg.value[0]?.toString()
    } else {
      return arg.value?.toString()
    }
  }

  if (type === FieldsConstants.TYPE_FILE) {
    if (arg.value) {
      if (arg.value.name) {
        return arg.value.name
      } else {
        return 'Filename not available'
      }
    }
  }

  if (typeof(arg.value) == "object") {
    return JSON.stringify(arg.value)
  }

  return arg.value
}

const toString = (value) => {
  switch (typeof value) {
    case 'boolean': 
      return String(value)
    default:
      return value.toString()
  }
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
    renderValue: ['any', false, ''],
    masked: ['boolean', false, false]
  },
  bindings: {
    label: {
      type: 'text',
      hook: 'label'
    },
    renderValue: {
      type: function (el, value, previousValue) {
        const str = toString(value)
        el.innerHTML = str
      },
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
