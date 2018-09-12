import View from 'ampersand-view'
import './styles.less'

module.exports = View.extend({
  template: `
    <div class="meter">
      <div class="percent-visual">
        <span data-hook="percent-visual"></span>
      </div>
      <div class="percent-text">
        <span data-hook="percent-text"></span>
      </div>
    </div>
  `,
  props: {
    percent: 'number'
  },
  derived: {
    percentText: {
      deps: ['percent'],
      fn () {
        return `${this.percent}%`
      }
    }
  },
  bindings: {
    percent: {
      type: function (el, value, previousValue) {
        el.style.width = value + '%'
      },
      hook: 'percent-visual'
    },
    percentText: {
      type: 'text',
      hook: 'percent-text'
    }
  }
})
