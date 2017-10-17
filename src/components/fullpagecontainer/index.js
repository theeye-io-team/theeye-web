import View from 'ampersand-view'
import './styles.css'

module.exports = View.extend({
  template: `<div class="full-page-container"></div>`,
  props: {
    autoAppend: ['boolean',false,false],
    content: 'state'
  },
  render () {
    this.renderWithTemplate()

    if (this.content && typeof this.content.render == 'function') {
      this.renderSubview(this.content, this.query('div'))
    }

    if (this.autoAppend) {
      document.body.appendChild( this.el )
    }
  }
})
