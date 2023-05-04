import App from 'ampersand-app'
import View from 'ampersand-view'
import Modalizer from 'components/modalizer'
import Form from './form'
import GroupRow from './group-row'

import './style.less'

export default View.extend({
  template: `
    <div>
      <h3 class="bold blue">Groups</h3>
      <div class="row">
        <div class="col-xs-6">
          <div class="groups-search">
            <i class="fa fa-search" aria-hidden="true"></i>
            <input autocomplete="off" data-hook="groups-input" class="groups-input" placeholder="Search">
          </div>
        </div>
        <div class="col-xs-6">
          <h4 class="pull-right cursor-pointer">
            <a class="blue" data-hook="create-group">
              <i class="fa fa-plus"></i> Create group
            </a>
          </h4>
        </div>
      </div>
      <div class="row">
        <div class="col-xs-12">
          <div data-hook="list-container"></div>
        </div>
      </div>
    </div>
  `,
  props: {
    groupSearch: ['string', false, '']
  },
  bindings: {
    groupSearch: {
      type: 'value',
      hook: 'groups-input'
    }
  },
  events: {
    'click [data-hook=create-group]': 'createGroup',
    'input [data-hook=groups-input]': 'onSearchInput'
  },
  render () {
    this.renderWithTemplate(this)
    this.renderCollection(
      App.state.groups,
      GroupRow,
      this.queryByHook('list-container'),
      {}
    )
  },
  createGroup () {
    const form = new Form({ model: new App.Models.Group.Model() })
    const modal = new Modalizer({
      title: 'Create group',
      bodyView: form,
      buttons: true,
      confirmButton: 'Create Group'
    })
    // this.listenTo(modal, 'shown', function () { form.focus() })
    this.listenTo(modal, 'hidden', function () {
      form.remove()
      modal.remove()
    })
    this.listenTo(modal, 'confirm', function () {
      form.beforeSubmit()
      if (!form.valid) return

      let data = form.prepareData()
      App.state.groups.create(data)
      modal.hide()
    })
    form.on('submit', (data) => {
      App.state.groups.create(data)
    })
    modal.show()
  },
  onSearchInput (event) {
    this._subviews[0].views.forEach(
      view => {
        view.visible = (
          view.model.name.toLowerCase().includes(event.target.value.toLowerCase())
        )
      }
    )
  }
})
