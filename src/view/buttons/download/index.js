import View from 'ampersand-view'

export default View.extend({
  props: {
    blob: 'string',
    text: ['string', true, 'Download file']
  },
  template: `
    <a href="" download="file" class="btn btn-primary" target="_blank">
      <i class="fa fa-download"></i>
      <span data-hook="text"></span>
    </a>
  `,
  events: {
    'click a': 'onAclick'
  },
  bindings: {
    blob: {
      selector: 'a',
      type: 'attribute',
      name: 'href'
    },
    text: {
      type: 'text',
      hook: 'text'
    }
  },
  onAclick (event) {
    event.stopPropagation()
  }
})
