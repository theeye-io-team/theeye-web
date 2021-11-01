import State from 'ampersand-state'

export default State.extend({
  props: {
    id: 'string',
    name: 'string',
    size: 'number',
    type: 'string',
    dataUrl: 'string',
    blob: 'object'
	}
})
