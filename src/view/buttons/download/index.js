import View from 'ampersand-view'

export default View.extend({
  props: {
    blob: 'string',
    text: ['string', true, 'Download file'],
    download: 'string'
  },
  template: `
    <div>
      <a data-hook="download-button" href="" download="" class="btn btn-primary" target="_blank">
        <i class="fa fa-download"></i>
        <span data-hook="text"></span>
      </a>
      <span data-hook="nofile">No file</span>
    </div>
  `,
  events: {
    'click a': 'onAclick'
  },
  bindings: {
    blob: [{
      selector: 'a',
      type: 'attribute',
      name: 'href'
    },{
      hook: 'download-button',
      type: 'toggle'
    },{
      hook: 'nofile',
      type: 'toggle',
      invert: true
    }],
    download: {
      selector: 'a',
      type: 'attribute',
      name: 'download'
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
