import AppModel from 'lib/app-model'

export default AppModel.extend({
  props: {
    id: 'string',
    name: 'string',
    size: 'number',
    type: 'string',
    dataUrl: 'string',
	}
})

