import View from 'ampersand-view'
import './styles.less'

module.exports = View.extend({
  template: `
    <div class="bars-component pull-left">
      <div class="progress progress-bar-vertical">
        <div data-hook="percent-visual" class="progress-bar">
        </div>
      </div>
    </div>
  `,
  props: {
    percent: 'number'
  },
  bindings: {
    percent: {
      type: function (el, value, previousValue) {
        el.style.height = value + '%'
        el.style.background = getBlueToRed(value)
      },
      hook: 'percent-visual'
    }
  }
})

const getBlueToRed = (percent) => {
  var b = percent < 50 ? 255 : Math.floor(255 - (percent * 2 - 100) * 255 / 100)
  var r = percent > 50 ? 255 : Math.floor((percent * 2) * 150 / 100)
  return `rgb(${r}, 0, ${b})`
}
