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
    <i class="fa fa-remove" title="Don't add this to the Template" data-hook="remove"></i>
    <i class="fa fa-eye" title="More" data-hook="show"></i>
  </li>`,
  props: {
    styles: ['string',false,'list-group-item']
  },
  bindings: {
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
    'click i[data-hook=remove]': function () {
      // won't be added to the template
      HostGroupActions.removeConfig(this.model)
    }
  }
})


export default View.extend({
  template: `
    <div class="template-configs">
      <div class="toggle" data-hook="configs-toggler">
        display host config <i class="fa fa-chevron-down"></i>
      </div>
      <div class="configs" data-hook="configs">
        <ul class="list-group" data-hook="resources">
          <h3>Host Monitors</h3>
        </ul>
        <ul class="list-group" data-hook="tasks">
          <h3>Host Tasks</h3>
        </ul>
      </div>
    </div>
  `,
  props: {
    valid: ['boolean',false,true],
    required: ['boolean',false,false],
    show_config: ['boolean',false,false],
    name: ['string',false,'configs'],
    required: ['boolean',false,true],
  },
  bindings: {
    show_config: {
      type: 'toggle',
      hook: 'configs'
    }
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
      ItemView,
      this.queryByHook('resources')
    )

    this.renderCollection(
      App.state.hostGroupPage.configTasks,
      ItemView,
      this.queryByHook('tasks')
    )
  }
})
