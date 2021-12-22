import AppModel from 'lib/app-model'
import AppCollection from 'lib/app-collection'

const Model = AppModel.extend({
  props: {
    name: 'string',
    show: ['boolean', false, false],
    active: ['boolean', false, false],
    showBadge: ['boolean', false, false]
  }
})

const Collection = AppCollection.extend({
  model: Model
})

export { Model, Collection }
