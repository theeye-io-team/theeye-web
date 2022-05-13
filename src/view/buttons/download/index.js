import View from 'ampersand-view'

export default View.extend({
  props: {
    value: 'string',
    text: ['string', true, 'Download file'],
    noFileText: ['string', true, 'No file provided'],
    download: 'string'
  },
  derived: {
    blob: {
      deps: ['value'],
      fn () {
        const value = this.value
        const blob = (value.indexOf('data:') === 0) ? value : undefined
        return blob
      }
    }
  },
  template: `
    <div>
      <a data-hook="download-button"
        href="" 
        download="" 
        class="btn btn-primary" 
        target="_blank">
        <i class="fa fa-download"></i>
        <span data-hook="text"></span>
      </a>
    </div>
  `,
  events: {
    'click a': 'onClickDownload'
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
          el.innerHTML = (value == "null" || !value) ? this.noFileText : this.text
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
        }
      }
    ],
    download: {
      selector: 'a',
      type: 'attribute',
      name: 'download'
    }
  },
  onClickDownload (event) {
    event.stopPropagation()
  }
})
