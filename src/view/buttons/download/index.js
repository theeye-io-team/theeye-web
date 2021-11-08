import View from 'ampersand-view'

export default View.extend({
  props: {
    blob: 'string',
    text: ['string', true, 'Download file'],
    download: 'string',
    mini: ['boolean', true, false]
  },
  template: `
    <a href="" download="" class="btn btn-primary" target="_blank">
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
    download: {
      selector: 'a',
      type: 'attribute',
      name: 'download'
    },
    text: {
      type: 'text',
      hook: 'text'
    },
    mini: {
      type: function (el, value) {
        if (value === true) {
          el.style.display = 'none'
        }
      },
      hook: 'text'
    }
  },
  onAclick (event) {
    event.stopPropagation()
  }
})
