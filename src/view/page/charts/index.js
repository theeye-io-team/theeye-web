import View from 'ampersand-view'
import html2dom from 'lib/html2dom'

import './style.less'

module.exports = View.extend({
  props: {
    iframe: 'string'
  },
  template: `<div class="charts-page"></div>`,
  initialize () {
    View.prototype.initialize.apply(this,arguments)
    this.resize = this.resize.bind(this)
  },
  render () {
    this.renderWithTemplate(this)
    this.el.appendChild( html2dom(this.iframe) )

    window.addEventListener('resize', this.resize, false)
    this.resize()
  },
  remove () {
    View.prototype.remove.apply(this, arguments)

    window.removeEventListener('resize', this.resize, false)
  },
  resize () {
    const iframe = this.query('iframe')

    const nav = document.querySelector('nav')
    const footer = document.querySelector('footer')
    const height = (window.innerHeight - nav.offsetHeight - footer.offsetHeight - 7)

    iframe.style.height = height + 'px'
  }
})
