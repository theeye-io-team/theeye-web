import View from 'ampersand-view'
import Clipboard from 'clipboard'
export default View.extend({
  props: {
    value: 'string',
    styles: ['string', false, 'float:right;']
  },
  render () {
    this.renderWithTemplate(this)

    new Clipboard(this.query('button'), {
      text: () => this.value
    })
  },
  bindings: {
    styles: {
      type: 'attribute',
      name: 'style'
    }
  },
  template: `
    <div style="">
      <button>
        <i class="fa fa-copy"></i>
      </button>
    </div>
  `
})

