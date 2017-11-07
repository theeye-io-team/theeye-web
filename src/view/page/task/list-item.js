'use strict'

import ListItem from 'components/list/item'
import View from 'ampersand-view'
import EditButton from './buttons/edit'
import CopyButton from './buttons/copy'
import DeleteButton from './buttons/delete'
import assign from 'lodash/assign'

function Factory (options) {
  const model = options.model
  if (model.type==='script') { // script task
    return new ScriptItem(options)
  }
  if (model.type==='scraper') {
    return new ScraperItem(options)
  }
  throw new Error(`unrecognized type ${model.type}`)
  //return new Item(options)
}

module.exports = Factory

const Item = ListItem.extend({
  derived: {
    item_name: {
      deps: ['model.name'],
      fn () {
        return this.model.name
      }
    },
    item_description: {
      deps: ['model.type'],
      fn () {
        return this.model.type
      }
    },
    badge: {
      deps: ['model.hasTemplate'],
      fn () {
        if (this.model.hasTemplate) {
          return 'fa fa-clone remark-success visible-badge'
        }
      }
    },
    badge_tip: {
      deps: ['model.hasTemplate'],
      fn () {
        if (this.model.hasTemplate) {
          return 'This task is linked to a Template'
        }
      }
    }
  },
  bindings: assign({},ListItem.prototype.bindings,{
    badge: {
      hook: 'item_badge',
      type: 'attribute',
      name: 'class'
    },
    badge_tip: {
      hook: 'item_badge',
      type: 'attribute',
      name: 'title'
    },
  }),
  render () {
    ListItem.prototype.render.apply(this,arguments)

    this.addButtons([
      { view: CopyButton, params: { model: this.model } },
      { view: EditButton, params: { model: this.model } },
      { view: DeleteButton, params: { model: this.model } },
    ])

    this.renderSubview(
      new Collapsed({ model: this.model }),
      this.queryByHook('collapsed-content')
    )
  }
})

const ScriptItem = Item.extend({
  derived: {
    item_description: {
      deps: ['model.script'],
      fn () {
        if (!this.model.script) return ''
        return this.model.script.filename
      }
    }
  },
})

const ScraperItem = Item.extend({
  derived: {
    item_description: {
      fn () {
        return 'Web Check'
      }
    }
  },
})

const Collapsed = View.extend({
  template: `<div class="col-sm-12"><h4>Task Information</h4></div>`,
})
