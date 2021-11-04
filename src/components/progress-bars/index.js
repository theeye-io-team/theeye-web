import View from 'ampersand-view'
import './styles.less'

export default View.extend({
  template: `
    <div data-component="progress-bar" class="meter">
      <div class="percent-visual">
        <span data-hook="percent-visual"></span>
      </div>
      <div class="percent-text">
        <span data-hook="percent-text"></span>
      </div>
    </div>
  `,
  props: {
    percent: 'number',
    color: ['string', false, "#42D5BB"]
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
    },
    color: {
      type: function (el, value) {
        el.style.backgroundColor = value
      },
      hook: 'percent-visual'
    }
  }
})
