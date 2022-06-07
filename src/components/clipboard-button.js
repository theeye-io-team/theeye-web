import View from 'ampersand-view'
import Clipboard from 'clipboard'
export default View.extend({
  props: {
    value: 'string'
  },
  render () {
    this.renderWithTemplate(this)

    new Clipboard(this.query('button'), {
      text: () => this.value
    })

  },
  template: `
    <div style="float:right;">
      <button>
        <i class="fa fa-copy"></i>
      </button>
    </div>
  `
})

