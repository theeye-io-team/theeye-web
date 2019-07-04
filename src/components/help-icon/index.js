
const $ = require('jquery')
import View from 'ampersand-view'
import './styles.less'

module.exports = View.extend({
  template: `
    <span data-component="help-icon" class="">
      <span class="fa fa-question-circle"></span>
    </span>
  `,
  props: {
    placement: ['string', false, 'top'],
    text: 'string',
    color: ['array', false, () => { return [48, 66, 105] }],
    link: 'string'
  },
  derived: {
    colorRGB: {
      deps: ['color'],
      fn () {
        return this.color.join(',')
      }
    }
  },
  bindings: {
    text: {
      type: 'attribute',
      name: 'title'
    }
  },
  events: {
    mouseover: function (e) {
      this.el.style.color = 'rgba(' + this.colorRGB + ', 1)'
    },
    mouseout: function (e) {
      this.el.style.color = 'rgba(' + this.colorRGB + ', 0.2)'
    },
    click: function (e) {
      if (!this.link) return
      window.open(this.link, '_blank')
    }
  },
  render () {
    this.renderWithTemplate(this)

    this.el.style.cursor = 'help'
    this.el.style.color = 'rgba(' + this.colorRGB + ', 0.2)'

    $(this.el).tooltip({
      container: this.el,
      placement: this.placement
    })
  }
})
