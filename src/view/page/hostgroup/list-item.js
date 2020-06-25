import ListItem from 'components/list/item'
import View from 'ampersand-view'
import EditButton from './buttons/edit'
import DeleteButton from './buttons/delete'
import ExportButton from './buttons/export'
import moment from 'moment'

export default ListItem.extend({
  derived: {
    item_name: {
      deps: ['model.name'],
      fn () {
        return this.model.name
      }
    },
    item_description: {
      fn () {
        return ''
      }
    }
  },
  render () {
    ListItem.prototype.render.apply(this,arguments)

    this.addButtons([
      { view: ExportButton, params: { model: this.model } },
      { view: EditButton, params: { model: this.model } },
      { view: DeleteButton, params: { model: this.model } }
    ])

    this.renderSubview(
      new Collapsed({ model: this.model }),
      this.queryByHook('collapsed-content')
    )
  }
})

const Collapsed = View.extend({
  bindings: {
    'model.description': {
      type: 'text',
      hook: 'description'
    },
    creation_date: {
      type: 'text',
      hook: 'creation_date'
    }
  },
  derived: {
    description: {
      deps: ['description'],
      fn () {
        let text = this.model.description
        if (!text) { return '' }
        return `Description: ${text}`
      }
    },
    creation_date: {
      deps: ['creation_date'],
      fn () {
        let date = this.model.creation_date
        if (!date) { return '' }
        let formatted = moment(date)
          .format("dddd, MMMM Do YYYY, h:mm:ss a")
        return `Created on ${formatted}`
      }
    }
  },
  template: `
    <div class="col-sm-12">
      <div><span data-hook="creation_date"></span></div>
      <div><span data-hook="description"></span></div>
    </div>
  `
})
