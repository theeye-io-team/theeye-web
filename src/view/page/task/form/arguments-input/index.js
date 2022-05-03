import App from 'ampersand-app'
import View from 'ampersand-view'
import Modalizer from 'components/modalizer'
import Collection from 'ampersand-collection'
import { DynamicArgument as TaskArgument } from 'models/task/dynamic-argument'
import * as FieldConstants from 'constants/field'
import HelpIcon from 'components/help-icon'
import TaskSelection from 'view/task-select'
import bootbox from 'bootbox'
import FileSaver from 'file-saver'

// component dependencies
import ArgumentsCreator from './creator'
import ArgumentView from './argument'

export default View.extend({
  template: `
    <div class="form-group">
      <label class="col-sm-3 control-label" data-hook="label">Input Arguments</label>
      <div class="col-sm-9">
        <div class="button-container" style="padding-bottom: 15px;">
          <button data-hook="add-argument"
            title="add new argument"
            class="btn btn-default"> Add new argument <i class="fa fa-plus"></i>
          </button>
          <button data-hook="copy-arguments"
            title="copy arguments"
            class="btn btn-default"> Copy arguments from another task <i class="fa fa-copy"></i>
          </button>
          <div style="display:inline-block;" data-hook="file-import-placeholder"></div>
          <button data-hook="export-arguments"
            title="export arguments"
            class="btn btn-default"> Export arguments to file <i class="fa fa-file-code-o"></i>
          </button>
        </div>
        <ul class="list-group">
          <li class="list-group-item">
            <div class="row" style="line-height: 30px;">
              <span data-hook="order-row-header" class="col-xs-1">Order</span>
              <span class="col-xs-3">Type</span>
              <span class="col-xs-3">Label</span>
              <span class="col-xs-3">Value</span>
              <span class="col-xs-2"></span>
            </div>
          </li>
        </ul>
      </div>
    </div>
  `,
  bindings: {
    visible: {
      type: 'toggle'
    },
    label: { hook: 'label' }
  },
  props: {
    isValid: ['boolean', false],
    visible: ['boolean', false, true],
    taskArguments: 'collection',
    name: ['string', false, 'taskArguments'],
    label: ['string', false, 'Task Arguments']
  },
  initialize (options) {
    // copy collection
    this.taskArguments = new Collection(options.value.serialize(), {
      parent: this,
      model: TaskArgument,
      comparator: 'order'
    })
    View.prototype.initialize.apply(this, arguments)
  },
  events: {
    'click [data-hook=add-argument]': 'onClickAddTaskArgument',
    'click [data-hook=copy-arguments]': 'onClickCopyTaskArguments',
    'click [data-hook=export-arguments]': 'exportArgumentsToArgumentsRecipe'
  },
  beforeSubmit () {
    const args = this.argumentsViews.views
    this.isValid = args.filter(arg => {
      arg.beforeSubmit()
      return arg.valid !== true
    }).length === 0
  },
  onClickAddTaskArgument (event) {
    event.preventDefault()
    event.stopPropagation()

    const creator = new ArgumentsCreator()

    const modal = new Modalizer({
      buttons: false,
      title: 'Arguments Creation',
      bodyView: creator
    })

    this.listenTo(modal, 'hidden', () => {
      creator.remove()
      modal.remove()
    })

    this.listenTo(creator, 'added', arg => {
      creator.remove()
      modal.remove()
      this.onArgumentAdded(arg)
    })

    modal.show()

    return false
  },
  onClickCopyTaskArguments (event) {
    event.preventDefault()
    event.stopPropagation()

    const select = new TaskSelection({
      filterOptions: [
        item => item.task_arguments.length > 0
      ]
    })

    const modal = new Modalizer({
      buttons: false,
      title: 'Copy arguments from',
      bodyView: select
    })

    this.listenTo(modal, 'hidden', () => {
      select.remove()
      modal.remove()
    })

    this.listenTo(select, 'change:value', () => {
      const task = App.state.tasks.get(select.value)
      this.setValue(task.task_arguments)
    })

    modal.show()

    return false
  },
  exportArgumentsToArgumentsRecipe () {
    // App.actions.task.exportArguments(this.parent.model.id)
    let warn = false
    let args = this.taskArguments.serialize()
    args.forEach(arg => {
      if (arg.type === 'fixed') {
        arg.value = undefined
        warn = true
      }
    })
    const callback = () => {
      const jsonContent = JSON.stringify(args)
      const blob = new Blob([jsonContent], { type: 'application/json' })
      const fileName = this.parent.model?.name?.replace(/ /g, '_') || 'unsaved_task'
      FileSaver.saveAs(blob, `${fileName}_arguments.json`)
    }
    if (warn) {
      bootbox.alert('For security reasons, "Fixed value" arguments are exported with an undefined value', callback)
    } else callback()
  },
  render () {
    this.renderWithTemplate(this)

    this.argumentsViews = this.renderCollection(
      this.taskArguments,
      ArgumentView,
      this.query('ul')
    )

    // when model removed change all arguments order to its new index
    this.listenTo(this.taskArguments, 'remove', this.onArgumentRemoved)

    this.renderSubview(
      new HelpIcon({ text: 'Click argument order to swap' }),
      this.queryByHook('order-row-header')
    )

    this.renderFileImportView()
  },
  renderFileImportView () {
    const fileImport = new FileImportView({ })
    this.renderSubview(fileImport, this.queryByHook("file-import-placeholder"))
    fileImport.on('value', (fileContent) => {
      if (!App.actions.task.recipeHasArguments(fileContent)) {
        bootbox.alert('There are no arguments to import')
        return
      }

      if (this.taskArguments.length > 0) {
        const modal = new AskToOverrideModal()

        this.listenTo(modal, 'button:override', () => {
          this.importFileContent(fileContent, true)
          modal.hide()
        })

        this.listenTo(modal, 'button:append', () => {
          this.importFileContent(fileContent)
          modal.hide()
        })

        this.listenTo(modal, 'hidden', () => {
          modal.remove()
        })

        modal.show()
      } else {
        this.importFileContent(fileContent)
      }
    })
  },
  importFileContent (fileContent, override = false) {
    if (override === true) {
      this.taskArguments.reset([])
    }

    if (Array.isArray(fileContent)) {
      this.importArgumentsFromArgumentsRecipe(fileContent)
    } else {
      this.importArgumentsFromTaskRecipe(fileContent)
    }
  },
  importArgumentsFromArgumentsRecipe (args) {
    if (args.length > 0) {
      let warn = false
      args.forEach(arg => {
        if (arg.type === 'fixed') {
          warn = true
        }
        this.onArgumentAdded(arg)
      })
      if (warn) {
        bootbox.alert('You have imported Fixed Arguments and you need to set the values manually')
      }
    }
  },
  importArgumentsFromTaskRecipe (recipe) {
    const task = App.actions.task.parseSerialization(recipe)
    const taskData = task.serialize()
    taskData.task_arguments.forEach(arg => {
      this.onArgumentAdded(arg)
    })
  },
  onArgumentRemoved (argument) {
    this.taskArguments.models.forEach((arg, index) => {
      arg.order = index
    })
  },
  onArgumentAdded (argument) {
    // get the last id + 1
    if (this.taskArguments.length === 0) {
      argument.id = 1
    } else {
      // taskArguments is not sorted by id
      argument.id = this.taskArguments.reduce((max, arg) => {
        return (arg.id >= max) ? arg.id : max
      }, 1) + 1 // starting from id 1 , get the last + 1
    }

    argument.order = this.taskArguments.length

    // fixed arguments does not has a label
    if (argument.type === FieldConstants.TYPE_FIXED) {
      // argument.label = `FixedArg${this.taskArguments.length}`
      argument.readonly = true
    }
    this.taskArguments.add(new TaskArgument(argument))
    this.trigger('change:taskArguments')
  },
  /**
   * @param {Mixed} value array of objects/models or a collection
   */
  setValue (args) {
    let value = (args.isCollection) ? args.serialize() : args
    this.taskArguments.reset(value)
  },
  derived: {
    valid: {
      deps: ['isValid'],
      fn () {
        return this.isValid
      }
    },
    value: {
      cache: false,
      deps: ['taskArguments'],
      fn () {
        return this.taskArguments.map(arg => arg.serialize())
      }
    }
  }
})

const FileImportView = View.extend({
  template: `
    <div data-component="file-import">
      <input type="file" name="file" id="file" style="display:none;">
      <label for="file" title="import arguments" class="btn btn-default"> 
        Import arguments from file <i class="fa fa-copy"></i>
      </label>
    </div>
  `,
  events: {
    'change input': 'onChangeInput'
  },
  onChangeInput (changeEvent) {
    const reader = new window.FileReader()
    const input = this.query('input')
    const file = input.files[0] // file input in single mode, read only 1st item in files array

    reader.onloadend = event => {
      file.contents = event.target.result
      if (
        file &&
        /json\/*/.test(file.type) === true &&
        file.contents &&
        file.contents.length
      ) {
        let fileContent
        try {
          fileContent = JSON.parse(file.contents)
        } catch (e) {
          bootbox.alert('Invalid JSON file.')
          return
        }

        this.trigger('value', fileContent)
      } else {
        bootbox.alert('Not a JSON file.')
      }

      input.value = '' // reset will allow to re import the same file again
    }

    reader.readAsText(file)
  }
})

const AskToOverrideModal = Modalizer.extend({
  template: `
    <div data-component="modalizer" class="modalizer">
      <!-- MODALIZER CONTAINER -->
      <div data-hook="modalizer-class" class="">
        <div class="modal"
          tabindex="-1"
          role="dialog"
          aria-labelledby="modal"
          aria-hidden="true"
          style="display:none;">
          <div class="modal-dialog">
            <div class="modal-content">
              <div class="modal-header">
                <button type="button"
                  class="close"
                  data-hook="close"
                  aria-label="Close">
                  <span aria-hidden="true">&times;</span>
                </button>
                <h4 data-hook="title" class="modal-title"></h4>
              </div>
              <div class="modal-body" data-hook="body">
                <span>This task already has arguments set up, do you want to override them? 
                  <div style="bottom:0; position:absolute;"> </div>
                </span>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-primary" data-hook="override">Override existing arguments</button>
                <button type="button" class="btn btn-primary" data-hook="append">Add arguments together</button>
                <button type="button" class="btn btn-default" data-hook="cancel">Cancel</button>
              </div>
            </div><!-- /MODAL-CONTENT -->
          </div><!-- /MODAL-DIALOG -->
        </div><!-- /MODAL -->
      </div><!-- /MODALIZER CONTAINER -->
    </div>
  `,
  initialize () {
    this.center = true
    this.fade = false
    this.title = 'Importing arguments'
    this.buttons = false // disable build-in modals buttons
    Modalizer.prototype.initialize.apply(this, arguments)
  },
  events: Object.assign({}, Modalizer.prototype.events, {
    'click [data-hook=override]': 'clickOverrideButton',
    'click [data-hook=append]': 'clickAppendButton',
  }),
  clickOverrideButton () {
    this.trigger('button:override')
  },
  clickAppendButton () {
    this.trigger('button:append')
  }
})
