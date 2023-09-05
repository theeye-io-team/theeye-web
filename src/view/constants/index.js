import App from 'ampersand-app'
import View from 'ampersand-view'
import Collection from 'ampersand-collection'
import InputView from 'components/input-view'
import State from 'ampersand-state'
import Modalizer from 'components/modalizer'
import TaskSelection from 'view/task-select'
import FileSaver from 'file-saver'
import './styles.less'

const ConstantsCollection = Collection.extend({
  indexes: ['id', 'key', 'value'],
  model: State.extend({
    props: {
      id: 'number',
      key: 'string',
      value: 'any'
    }
  }),
  /**
   * Convert an Object of { key: value } into and Array [ { key, value } ]
   *
   * @param {Object} models
   */
  reset (models) {
    const values = []
    if (Array.isArray(models)) {
      return Collection.prototype.reset.call(this, models)
    } else {
      // remap into array
      for (let key in models) {
        const elem = {}
        elem["key"] = key
        elem["value"] = models[key]
        values.push(elem)
      }

      return Collection.prototype.reset.call(this, values)
    }
  }
})

export default View.extend({
  template: `
    <div class="form-group" data-component="constants-view-component">
      <label class="col-sm-3 control-label" data-hook="label">
      </label>
      <div class="col-sm-9">
        <div>
          <button data-hook="add" class="btn btn-default">
            Add <i class="fa fa-plus"></i>
          </button>
          <button data-hook="copy"
            title="copy contants"
            class="btn btn-default">
              Copy <i class="fa fa-copy"></i>
          </button>
          <button data-hook="export"
            title="export constants"
            class="btn btn-default">
              Export <i class="fa fa-download"></i>
          </button>
          <ul data-hook="list-group" class="list-group"></ul>
        </div>
      </div>
    </div>
  `,
  props: {
    outputFormat: ['string', false, 'object'],
    label: ['string',false,'constants'],
    name: ['string',false,'env'],
    required: ['boolean', false, false],
    visible: ['boolean', false, true],
    values: ['object', true, () => { return {} }],
    validValues: ['boolean', false],
    variablesLength: ['number', false, 0],
    copyButton: ['boolean', false, true],
    exportButton: ['boolean', false, true],
  },
  collections: {
    constants: ConstantsCollection
  },
  initialize (options) {
    View.prototype.initialize.apply(this, arguments)
    this.setValue(this.values)
    this.on('change:valid change:value', this.reportToParent, this)

    this.constants.on('add remove reset sync', () => {
      this.variablesLength = this.constants.length
    })
    this.variablesLength = this.constants.length
  },
  derived: {
    hasVariables: {
      deps: ['variablesLength'],
      fn () {
        return Boolean(this.variablesLength > 0)
      }
    },
    value: {
      cache: false,
      fn () {
        const values = (this.outputFormat === 'array') ? [] : {}

        this.variableViews
          .views
          .forEach(v => {
            if (Array.isArray(values)) {
              const elem = {}
              elem.k = v.key
              elem.v = v.label
              values.push(elem)
            } else {
              values[v.key] = v.label
            }
          })

        return values
      }
    },
    valid: {
      deps: ['validValues'],
      fn () {
        return this.validValues
      }
    }
  },
  bindings: {
    hasVariables: {
      hook: 'list-group',
      type: 'toggle',
    },
    copyButton: {
      hook: 'copy',
      type: 'toggle',
    },
    exportButton: {
      hook: 'export',
      type: 'toggle',
    },
    label: {
      hook: 'label'
    },
    visible: {
      type: 'toggle'
    }
  },
  events: {
    'click [data-hook=add]': 'onClickAdd',
    'click [data-hook=copy]': 'onClickCopyFrom',
    'click [data-hook=export]': 'onClickExport',
  },
  onClickAdd (event) {
    event.preventDefault()
    event.stopPropagation()

    this.constants.add({
      id: new Date().getTime(),
      key: '',
      value: ''
    })

    return false
  },
  onClickExport (event) {
    event.preventDefault()
    event.stopPropagation()

    const envs = []
    for (let prop in this.value) {
      envs.push(`${prop} = "${this.value[prop]}"`)
    }
    const blob = new Blob([ envs.join('\n') ], { type: 'text/plain' })
    const fileName = this.parent.model?.name?.replace(/ /g, '_')
    FileSaver.saveAs(blob, `${fileName}.env`)
  },
  onClickCopyFrom (event) {
    event.preventDefault()
    event.stopPropagation()

    const selectView = new TaskSelection({
      filterOptions: [
        item => item.env && Object.keys(item.env).length > 0
      ]
    })

    const modal = new Modalizer({
      buttons: false,
      title: 'Copy Environment from',
      bodyView: selectView
    })

    this.listenTo(modal,'hidden',() => {
      selectView.remove()
      modal.remove()
    })

    this.listenTo(selectView, 'change:value', () => {
      const task = App.state.tasks.get(selectView.value)
      this.setValue(task.env)
    })

    modal.show()
    return false
  },
  setValue (values) {
    // need an object with key , values
    if (this.outputFormat === 'array') {
      // we need to remap the array of maps into a map
      const vmap = []
      values.forEach((el, index) => {
        if (typeof el === 'string') {
          vmap.push({ id: index, key: index, value: el })
        } else {
          // internal key, value representation
          vmap.push({ id: index, key: el.k, value: el.v })
        }
      })

      this.constants.reset(vmap)
    } else {
      this.constants.reset(values)
    }
  },
  render () {
    this.renderWithTemplate(this)

    const collVu = this.variableViews = this.renderCollection(
      this.constants,
      EnvVarView,
      this.queryByHook('list-group')
    )

    collVu.collection.on('add', child => {
      const view = collVu.views.find(vu => vu.model === child)
      view.keyInputView.input.focus()
    })
  },
  update () {
    this.reportToParent()
  },
  reportToParent () {
    if (this.parent) { this.parent.update(this) }
  },
  beforeSubmit () {
    this.variableViews.views.forEach(vu => vu.beforeSubmit())
    this.runTests()
  },
  runTests () {
    if (this.variableViews.views.length === 0) {
      this.validValues = true
      return
    }

    this.validValues = this.variableViews.views.every(view => view.valid)
  }
})

const EnvVarView = View.extend({
  template: `
    <li class="list-group-item">
      <div class="row">
        <span class="col-xs-5" data-hook="key"> </span>
        <span class="col-xs-5" data-hook="label"> </span>
        <span class="col-xs-2 form-group">
          <button data-hook="remove-option" class="btn btn-default">
            Remove
          </button>
        </span>
      </div>
    </li>
  `,
  initialize () {
    View.prototype.initialize.apply(this,arguments)
    this.updateState(this.model)
    this.on('change:valid change:value', this.reportToParent, this)
  },
  updateState (state) {
    this.key = state.key
    this.label = state.value
  },
  props: {
    key: 'string',
    label: 'any',
    name: ['string', false, 'env_var'] // my input name
  },
  derived: {
    value: {
      deps: ['key', 'label'],
      fn () {
        return {
          key: this.key,
          value: this.label
        }
      }
    },
    valid: {
      deps: ['key', 'label'],
      fn () {
        return (
          this.key !== '' &&
          this.label !== '' &&
          this.key !== undefined &&
          this.label !== undefined
        )
      }
    }
  },
  events: {
    'click [data-hook=remove-option]': 'onClickRemoveButton'
  },
  onClickRemoveButton (event) {
    event.preventDefault()
    event.stopPropagation()
    // mmmmm...
    this.model.collection.remove(this.model)
  },
  render () {
    this.renderWithTemplate(this)

    this.keyInputView = new SimpleInputView({
      name: 'key',
      value: this.model.key,
      placeholder: 'Key',
      invalidClass: 'text-danger',
      validityClassSelector: 'p[data-hook=message-text]',
      required: true
    })
    this.renderSubview(this.keyInputView, this.queryByHook('key'))

    this.valueInputView = new SimpleInputView({
      name: 'value',
      value: this.model.value,
      placeholder: 'Value',
      invalidClass: 'text-danger',
      validityClassSelector: 'p[data-hook=message-text]',
      required: true
    })
    this.renderSubview(this.valueInputView, this.queryByHook('label'))

    this.listenTo(this.valueInputView, 'change:valid', this.validityCheck)
    this.listenTo(this.keyInputView, 'change:valid', this.validityCheck)

    // use internal state
    this.listenTo(this.keyInputView, 'change:value', () => {
      this.key = this.keyInputView.value
    })

    this.listenTo(this.valueInputView, 'change:value', () => {
      this.label = this.valueInputView.value
    })
  },
  update () {
    this.reportToParent()
  },
  reportToParent () {
    if (this.parent) { this.parent.update(this) }
  },
  beforeSubmit () {
    this.keyInputView.beforeSubmit()
    this.valueInputView.beforeSubmit()
    this.validityCheck()
  },
  validityCheck () {
    const key = this.keyInputView
    const value = this.valueInputView

    if (!key.valid || !value.valid) {
      this.el.classList.add('box-danger')
    } else {
      this.el.classList.remove('box-danger')
    }
  }
})

const SimpleInputView = InputView.extend({
  template: `
    <div style="margin:0;">
      <input class="form-control form-input">
      <div data-hook="message-container" class="message message-below message-error">
        <p data-hook="message-text"></p>
      </div>
    </div>
  `
})

