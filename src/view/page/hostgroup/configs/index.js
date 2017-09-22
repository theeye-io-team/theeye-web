import merge from 'lodash/merge'
import App from 'ampersand-app'
import View from 'ampersand-view'
import Modalizer from 'components/modalizer'
import HostGroupActions from 'actions/hostgroup'

import './styles.css'

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
    <i class="fa fa-remove" title="Do not add this to the Template" data-hook="remove-button"></i>
    <i class="fa fa-eye" title="More" data-hook="show" style="display:none"></i>
  </li>`,
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

/**
 *
 * the model data structure changes before creation
 *
 */
const ShowTriggerItemView = ItemView.extend({
  initialize () {
    ItemView.prototype.initialize.apply(this,arguments)
  },
  template: `
    <li>
      <b><span data-hook="task-name"></span></b>
      trigger on <span data-hook="type"></span>
      <span data-hook="name"></span>
    </li>`,
  bindings: merge({}, ItemView.prototype.bindings, {
    'model.event_name': { hook: 'name' },
    'model.event_type': { hook: 'type' },
    'model.task_template.name': { hook: 'task-name' }
  })
})

/**
 *
 * this view display different information that the above view
 *
 */
const CreateTriggerItemView = ItemView.extend({
  template: `
  <li>
    <span data-hook="name"></span>
    <span data-hook="count-visibility">(<span data-hook="count"></span> events attached)</span>
    <i class="fa fa-remove" title="Do not add this to the Template" data-hook="remove-button"></i>
    <i class="fa fa-eye" title="More" data-hook="show" style="display:none"></i>
  </li>`,
  bindings: merge({}, ItemView.prototype.bindings, {
    'model.task.name': {
      type: 'text',
      hook: 'name'
    },
    'model.events.length': [{
      type: 'text',
      hook: 'count'
    //},{
    //  type: 'toggle',
    //  hook: 'count-visibility'
    }]
  })
})

module.exports = View.extend({
  template: `
    <div class="template-configs" style="padding:10px;">
      <div class="toggle" data-hook="configs-toggler">
        Display host config <i class="fa fa-chevron-down"></i>
      </div>
      <div class="configs" data-hook="configs">
        <ul class="list-group" data-hook="resources">
          <h3><span>No</span> Monitors</h3>
        </ul>
        <ul class="list-group" data-hook="tasks">
          <h3><span>No</span> Tasks</h3>
        </ul>
        <ul class="list-group" data-hook="triggers">
          <h3><span>No</span> Triggers</h3>
        </ul>
      </div>
    </div>
  `,
  props: {
    valid: ['boolean',false,true],
    show_config: ['boolean',false,false],
    name: ['string',false,'configs'],
    required: ['boolean',false,true],
    edit_mode: ['boolean',false,false],
    no_resources: ['boolean',false,false],
    no_tasks: ['boolean',false,false],
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
      App.state.hostGroupPage.configResources,
      (options) => {
        options.readonly = ! this.edit_mode
        return new ItemView(options)
      },
      this.queryByHook('resources')
    )

    this.renderCollection(
      App.state.hostGroupPage.configTasks,
      (options) => {
        options.readonly = ! this.edit_mode
        return new ItemView(options)
      },
      this.queryByHook('tasks')
    )

    this.renderCollection(
      App.state.hostGroupPage.configTriggers,
      (options) => {
        // edit only when create
        options.readonly = ! this.edit_mode
        if (options.readonly===true) {
          return new ShowTriggerItemView(options)
        } else {
          return new CreateTriggerItemView(options)
        }
      },
      this.queryByHook('triggers')
    )

    this.listenTo(App.state.hostGroupPage.configResources,'reset add remove',() => {
      this.no_resources = (App.state.hostGroupPage.configResources.length === 0)
    })
    this.listenTo(App.state.hostGroupPage.configTasks,'reset add remove',() => {
      this.no_tasks = (App.state.hostGroupPage.configTasks.length === 0)
    })
    this.listenTo(App.state.hostGroupPage.configTriggers,'reset add remove',() => {
      this.no_triggers = (App.state.hostGroupPage.configTriggers.length === 0)
    })
  }
})
