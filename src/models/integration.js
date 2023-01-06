
import State from 'ampersand-state'
export const Integration = State.extend({
  props: {
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

