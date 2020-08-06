import View from 'ampersand-view'
import './styles.less'

import { ScriptTips as Tips } from 'language/tips'

export default View.extend({
  template: `
    <p data-component="random-tip" class="bg-info" style="padding: 8px;">
      <span class="label label-success">Tip</span>&nbsp;
      <a data-hook="prev" class="fa fa-chevron-left"></a>
      <a data-hook="next" class="fa fa-chevron-right"></a>
      <span data-hook="tip"></span>
    </p>
  `,
  initialize () {
    View.prototype.initialize.apply(this, arguments)
    this.tipIndex = randomTip()
  },
  props: {
    tipIndex: 'number'
  },
  bindings: {
    tip: {
      type: 'innerHTML',
      hook: 'tip'
    }
  },
  derived: {
    tip: {
      deps: ['tipIndex'],
      fn () {
        return `#${this.tipIndex + 1}/${Tips.length}. ${Tips[this.tipIndex]}`
      }
    }
  },
  events: {
    'click a[data-hook=prev]':'onClickPreviousTip',
    'click a[data-hook=next]':'onClickNextTip'
  },
  onClickNextTip (event) {
    event.preventDefault()
    event.stopPropagation()

    if (this.tipIndex === (Tips.length - 1)) {
      this.tipIndex = 0 // the first
    } else {
      this.tipIndex++
    }
  },
  onClickPreviousTip (event) {
    event.preventDefault()
    event.stopPropagation()

    if (this.tipIndex === 0) {
      this.tipIndex = Tips.length - 1 // the last
    } else {
      this.tipIndex--
    }
  }
})

const randomTip = () => {
  let max = Tips.length
  return Math.floor(Math.random() * Math.floor(max))
}
