import View from 'ampersand-view'

export default View.extend({
  props: {
    blob: 'string',
    text: ['string', true, 'Download file'],
    noFileText: ['string', true, 'No file provided'],
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
    blob: [
      {
        selector: 'a',
        type: 'attribute',
        name: 'href'
      },
      {
        type: function (el, value) {
          el.innerHTML = 
            value == "null" || !value ? 
              this.noFileText : 
              this.text
        },
        hook: 'text'
      },
      {
        selector: 'a',
        type: function (el, value) {
          if (value == "null" || !value) {
            el.classList.add('disabled')
          } else {
            el.classList.remove('disabled')
          }
        },
      }
    ]
    download: {
      selector: 'a',
      type: 'attribute',
      name: 'download'
    }
  },
  onAclick (event) {
    event.stopPropagation()
  }
}
