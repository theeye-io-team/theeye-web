import AppModel from 'lib/app-model'

const Model = AppModel.extend({
  props: {
    id: 'string',
    name: 'string',
    size: 'number',
    type: 'string',
    dataUrl: 'string',
	}
})

exports.Model = Model
