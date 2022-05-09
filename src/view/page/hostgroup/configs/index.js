import App from 'ampersand-app'
import View from 'ampersand-view'
import Modalizer from 'components/modalizer'
import HostGroupActions from 'actions/hostgroup'

import './styles.less'

export default View.extend({
  template: `
    <div data-component="template-configs">
      <div class="toggle" data-hook="configs-toggler">
        Display selected Bot config <i class="fa fa-chevron-down"></i>
      </div>
      <div class="configs" data-hook="configs">
        <ul class="list-group" data-hook="resources">
          <h3><span>No</span> Monitors</h3>
        </ul>
        <ul class="list-group" data-hook="tasks">
          <h3><span>No</span> Tasks</h3>
        </ul>
        <ul class="list-group" data-hook="files">
          <h3><span>No</span> Files</h3>
        </ul>
        <ul class="list-group" data-hook="triggers">
          <h3><span>No</span> Triggers</h3>
        </ul>
      </div>
    </div>
  `,
  props: {
    valid: ['boolean',false,true],
    show_config: ['boolean',false,true],
    name: ['string',false,'configs'],
    required: ['boolean',false,true],
    edit_mode: ['boolean',false,false],
    no_resources: ['boolean',false,false],
    no_tasks: ['boolean',false,false],
    no_files: ['boolean',false,false],
    no_triggers: ['boolean',false,false],
  },
  bindings: {
    show_config: {
      type: 'toggle',
      hook: 'configs'
    },
    no_resources: [
      {
        type: 'booleanClass',
        name: 'empty',
        hook: 'resources'
      },{
        type: 'toggle',
        selector: '.configs [data-hook=resources]>h3>span'
      }
    ],
    no_tasks: [
      {
        type: 'booleanClass',
        name: 'empty',
        hook: 'tasks'
      },{
        type: 'toggle',
        selector: '.configs [data-hook=tasks]>h3>span'
      }
    ],
    no_files: [
      {
        type: 'booleanClass',
        name: 'empty',
        hook: 'files'
      },{
        type: 'toggle',
        selector: '.configs [data-hook=files]>h3>span'
      }
    ],
    no_triggers: [
      {
        type: 'booleanClass',
        name: 'empty',
        hook: 'triggers'
      },{
        type: 'toggle',
        selector: '.configs [data-hook=triggers]>h3>span'
      }
    ],
  },
  events: {
    'click [data-hook=configs-toggler]': function () {
      this.toggle('show_config')
    }
  },
  render () {
    this.renderWithTemplate(this)

    this.renderCollection(
      App.state.hostGroupPage.resources,
      (options) => {
        options.readonly = ! this.edit_mode
        return new ItemView(options)
      },
      this.queryByHook('resources')
    )

    this.renderCollection(
      App.state.hostGroupPage.tasks,
      (options) => {
        options.readonly = ! this.edit_mode
        return new ItemView(options)
      },
      this.queryByHook('tasks')
    )

    this.renderCollection(
      App.state.hostGroupPage.files,
      (options) => {
        options.readonly = ! this.edit_mode
        return new FileItemView(options)
      },
      this.queryByHook('files')
    )

    this.renderCollection(
      App.state.hostGroupPage.triggers,
      (options) => {
        const trigger = options.model
        const task = App.state.hostGroupPage.tasks
          .models // tasks array
          .find(task => {
            return (
              task.source_model_id === trigger.task_id ||
              task.id === trigger.task_id
            )
          })

        // @TODO we can identify the originator of the event
        // by searching the emitter using the event_type and the associated collection

        // edit only when create
        options.readonly = ! this.edit_mode
        options.task_name = task?.name||'not found'
        options.event_name = trigger.event_name
        options.event_type = trigger.event_type
        return new TriggerItemView(options)
      },
      this.queryByHook('triggers')
    )

    this.listenTo(App.state.hostGroupPage.resources,'reset add remove',() => {
      this.no_resources = (App.state.hostGroupPage.resources.length === 0)
    })
    this.listenTo(App.state.hostGroupPage.tasks,'reset add remove',() => {
      this.no_tasks = (App.state.hostGroupPage.tasks.length === 0)
    })
    this.listenTo(App.state.hostGroupPage.files,'reset add remove',() => {
      this.no_files = (App.state.hostGroupPage.files.length === 0)
    })
    this.listenTo(App.state.hostGroupPage.triggers,'reset add remove',() => {
      this.no_triggers = (App.state.hostGroupPage.triggers.length === 0)
    })
  }
})

const InfoView = View.extend({
  template: `<div></div>`,
  bindings: {
    'model.name': { type: 'text' }
  }
})

const ItemView = View.extend({
  template: `
    <li>
      <span data-hook="name"></span>
      (<span data-hook="type"></span>)
      <i class="fa fa-eye" title="More" data-hook="show" style="display:none"></i>
    </li>
  `,
  props: {
    styles: ['string',false,'list-group-item'],
    readonly: ['boolean',false,false]
  },
  bindings: {
    readonly: {
      type: 'toggle',
      hook: 'remove-button',
      invert: true
    },
    styles: {
      type: 'attribute',
      name: 'class'
    },
    'model.name': {
      type: 'text',
      hook: 'name'
    },
    'model.type': {
      type: 'text',
      hook: 'type'
    }
  },
  events: {
    'click i[data-hook=show]': function () {
      const info = new InfoView({ model: this.model })
      const modal = new Modalizer({
        buttons: false,
        title: 'Info',
        bodyView: info,
        removeOnHide: true
      })
      modal.show()
    },
    'click i[data-hook=remove-button]': function () {
      // won't be added to the template
      HostGroupActions.removeConfig(this.model)
    }
  }
})

const FileItemView = ItemView.extend({
  template: `
    <li>
      <span data-hook="filename"></span>
      <button class="btn btn-sm btn-default" data-hook="edit">
        <i class="fa fa-eye"></i>
      </button>
    </li>
  `,
  derived: {
    attached_to: {
      deps: ['model'],
      fn () {
        //let fid = this.model.id
      }
    }
  },
  events: {
    'click button': 'onClickViewFile'
  },
  onClickViewFile (event) {
    event.preventDefault()
    event.stopPropagation()

    App.actions.file.edit(this.model)
  },
  bindings: Object.assign({}, ItemView.prototype.bindings, {
    'model.filename': { hook: 'filename' },
  })
})

const TriggerItemView = ItemView.extend({
  props: {
    event_name: 'string',
    event_type: 'string',
    task_name: 'string'
  },
  template: `
    <li>
      <span data-hook="task_name"></span>
      <span data-hook="event_type"></span>
      <span data-hook="event_name"></span>
      <i class="fa fa-remove" title="Do not add this to the Template" data-hook="remove-button"></i>
      <i class="fa fa-eye" title="More" data-hook="show" style="display:none"></i>
    </li>
  `,
  bindings: {
    readonly: {
      type: 'toggle',
      hook: 'remove-button',
      invert: true
    },
    styles: {
      type: 'attribute',
      name: 'class'
    },
    'task_name': {
      type: 'text',
      hook: 'task_name'
    },
    'event_name': {
      type: 'text',
      hook: 'event_name'
    },
    'event_type': {
      type: 'text',
      hook: 'event_type'
    }
  }
})
