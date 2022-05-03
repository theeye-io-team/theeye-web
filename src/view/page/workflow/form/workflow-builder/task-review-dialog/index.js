import Modalizer from 'components/modalizer'
import App from 'ampersand-app'
import Collection from 'ampersand-collection'
import View from 'ampersand-view'
import HostSelectionComponent from '../../host-selection'
import './styles.less'

export default Modalizer.extend({
  autoRender: false,
  props: {
    workflow: 'state',
    autohost: 'boolean'
  },
  bindings: {
    autohost: {
      hook: 'autohost',
      type: 'toggle'
    }
  },
  initialize () {
    this.buttons = false // disable build-in modal buttons
    Modalizer.prototype.initialize.apply(this, arguments)
    this.on('hidden', () => { this.remove() })

    if (App.state.hosts.length === 1) {
      this.listenToAndRun(this.workflow, 'change:tasks', () => {
        this.updateState()
      })
    }
  },
  updateState () {
    this.autohost = this.workflow
      .getInvalidTasks()
      .models
      .map(t => t.missingConfiguration)
      .filter(c => {
        return (c.find(p => p.label === 'Host') !== undefined)
      })
      .length > 0
  },
  template () {
    return `
    <div data-component="invalid-tasks-dialog" class="modalizer">
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
                <button type="button" data-hook="close-${this.cid}" class="close" aria-label="Close">
                  <span aria-hidden="true">&times;</span>
                </button>
                <h4 data-hook="title" class="modal-title">
                  Review the following tasks
                </h4>
              </div>
              <div class="modal-body" data-hook="body">
                <section class="actions" data-hook="actions-container">
                  <button class="autocomplete" data-hook="autohost">
                    <i class="fa fa-server"></i> Autocomplete Host
                  </button>
                </section>
                <ul class="tasks-list" data-hook="tasks-container"></ul>
              </div>
            </div><!-- /MODAL-CONTENT -->
          </div><!-- /MODAL-DIALOG -->
        </div><!-- /MODAL -->
      </div><!-- /MODALIZER CONTAINER -->
    </div>
  `
  },
  events: Object.assign({}, Modalizer.prototype.events, {
    'click [data-hook=autohost]': function (event) {
      event.preventDefault()
      event.stopPropagation()

      if ( App.state.hosts.length !== 1 ) { return }

      const tasksCollection = this.workflow.getInvalidTasks()

      for (let task of tasksCollection.models) {
        for (let cfg of task.missingConfiguration) {
          if (/host/i.test(cfg.label)) {
            const host = App.state.hosts.models[0]
            task.host_id = host.id
          }
        }
      }
    }
  }),
  render () {
    Modalizer.prototype.render.apply(this, arguments)

    const view = new HostSelectionComponent({
      value: 'Set the host for all tasks',
      onSelection: (id) => {
        this.workflow.setHost(id)
      }
    })

    this.renderSubview(view, this.queryByHook('actions-container'))
    view.el.querySelector('label').remove()

    const tasksCollection = this.workflow.getInvalidTasks()

    this.renderCollection(
      tasksCollection,
      InvalidTaskView,
      this.queryByHook('tasks-container'),
      {}
      //{reverse: true}
    )
  }
})

const InvalidTaskView = View.extend({
  template: `
    <li class="tasks-list-item">
      <!-- row -->
      <div class="">
        <span data-hook="task-name"></span>
      </div>
      <div class="" style="text-align: right;">
        <button type="button" class="btn btn-default" data-hook="edit-task">
          <i class="fa fa-edit"></i>
        </button>
      </div>
      <!-- row -->
      <ul data-hook="tasks-missconfiguration" class=""> </ul>
    </li>
  `,
  bindings: {
    'model.name': {
      hook: 'task-name'
    },
    'model.id': {
      hook: 'edit-task',
      type: 'attribute',
      name: 'data-task-id'
    }
  },
  events: {
    'click [data-hook=edit-task]': 'onClickEditTask'
  },
  onClickEditTask (event) {
    const jsevent = new CustomEvent('click [data-hook=edit-task]', {
      bubbles: true,
      detail: { task: this.model }
    })

    this.el.dispatchEvent(jsevent)
  },
  render () {
    this.renderWithTemplate()

    const missing = this.model.missingConfiguration
      .map(missing => {
        return { label: missing.label }
      })

    const missingConfiguration = new Collection(missing)

    this.renderCollection(
      missingConfiguration,
      ({ model }) => {
        return new MissingConfigurationView({ label: model.label })
      },
      this.queryByHook('tasks-missconfiguration'),
      {}
    )

    this.listenTo(this.model, 'change', () => {
      if (this.model.missingConfiguration.length === 0) {
        const btn = this.queryByHook('edit-task')
        btn.disabled = true
        const icon = btn.querySelector('i')
        icon.classList.remove('fa-edit')
        icon.classList.add('fa-check')
        btn.classList.add('alert-success')
      }
    })
  }
})

const MissingConfigurationView = View.extend({ 
  props: {
    label: 'string',
  },
  template: `<li></li>`,
  bindings: {
    'label': { selector: 'li' }
  }
})
