import ListItem from 'components/list/item'
import View from 'ampersand-view'
import assign from 'lodash/assign'
import EditButton from './buttons/edit'
import DeleteButton from './buttons/delete'

module.exports = ListItem.extend({
  derived: {
    item_name: {
      deps: ['model.filename'],
      fn () {
        return this.model.filename
      }
    },
    item_description: {
      deps: ['model.description'],
      fn () {
        return this.model.description
      }
    },
    //badge: {
    //  deps: ['model.hasTemplate'],
    //  fn () {
    //    if (this.model.hasTemplate) {
    //      return 'fa fa-clone remark-success visible-badge'
    //    }
    //  }
    //},
    //badge_tip: {
    //  deps: ['model.hasTemplate'],
    //  fn () {
    //    if (this.model.hasTemplate) {
    //      return 'This task is linked to a Template'
    //    }
    //  }
    //}
  },
  //bindings: assign({},ListItem.prototype.bindings,{
  //  badge: {
  //    hook: 'item_badge',
  //    type: 'attribute',
  //    name: 'class'
  //  },
  //  badge_tip: {
  //    hook: 'item_badge',
  //    type: 'attribute',
  //    name: 'title'
  //  },
  //}),
  render () {
    ListItem.prototype.render.apply(this,arguments)

    this.addButtons([
      { view: EditButton, params: { model: this.model } },
      { view: DeleteButton, params: { model: this.model } },
    ])

    this.renderSubview(
      new Collapsed({ model: this.model }),
      this.queryByHook('collapsed-content')
    )
  }
})

const Collapsed = View.extend({
  template: `<div class="col-sm-12"><h4>File Information</h4></div>`,
})
