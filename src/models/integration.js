
import Collection from 'ampersand-collection'
import State from 'ampersand-state'

export const Integration = State.extend({
  extraProperties: 'allow',
  props: {
    id: 'string',
    type: 'string',
    enabled: 'boolean',
    menu: 'boolean',
    name: 'string',
    label: 'string',
    class: ['string', false, 'eyeicon eyemenu-icon '],
    url: ['string',false,'#'],
    icon: 'string'
  }
})

export const Integrations = Collection.extend({
  model: Integration
})
