'use strict'

import App from 'ampersand-app'
import View from 'ampersand-view'
import Modalizer from 'components/modalizer'
import './styles.less'
import linkify from 'linkifyjs/string'

export default Modalizer.extend({
  initialize () {
    this.title = 'Theeye says:'
    this.class = 'popup'
    this.bodyView = new PopupContentView({})

    this.listenTo(App.state.popup, 'change', this.updateState)
    this.on('hidden', () => App.actions.popup.hide())

    Modalizer.prototype.initialize.apply(this, arguments)
  },
  updateState () {
    if (App.state.popup.visible) {
      this.title = App.state.popup.title
      this.show()
    } else {
      this.hide()
    }
  }
})

const PopupContentView = View.extend({
  initialize () {
    View.prototype.initialize.apply(this, arguments)
    this.listenTo(App.state.popup, 'change:content', this.updateContent)
  },
  template: `
    <div>
      <div data-hook="content" class="content"></div>
    </div>
  `,
  props: {
    content: ['string', false, '']
  },
  bindings: {
    content: {
      hook: 'content',
      type: 'innerHTML'
    }
  },
  updateContent () {
    const content = App.state.popup.content

    let html = ''
    if (Array.isArray(content)) {
      html = `<ul>`
      content.forEach(item => {
        let htmlText = linkify(sanitizeValue(item))
        html += `<li>${htmlText}</li>`
      })
      html += `</ul>`
    } else {
      // turns into text
      html = linkify(sanitizeValue(content))
    }

    this.content = html
  }
})

const sanitizeValue = (value) => {
  const escaper = document.createElement('textarea')
  escaper.textContent = value
  let html = escaper.innerHTML
  //escaper.remove()
  return html
}
