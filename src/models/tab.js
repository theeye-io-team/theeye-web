import AppModel from 'lib/app-model'
import AppCollection from 'lib/app-collection'

const Model = AppModel.extend({
  props: {
    name: 'string',
    show: ['boolean', false, true],
    active: ['boolean', false, false],
    showBadge: ['boolean', false, false]
  }
})

const Collection = AppCollection.extend({
  model: Model
})

exports.Model = Model
exports.Collection = Collection
