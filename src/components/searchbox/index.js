import View from 'ampersand-view'
import './styles.less'

export default View.extend({
  props: {
    input_value: 'string'
  },
  template: `
    <span data-component="search-box">
      <a href="" data-hook="search-button">
        <i class="fa fa-search"></i>
      </a>
      <input name="search">
    </span>
  `,
  events: {
    'keydown input': 'onKeyEvent',
    'click [data-hook=search-button]': 'onClickSearchButtonEvent',
    'focus input': 'onFocusEvent',
    'focusout input': 'onFocusOutEvent'
    //'keypress': 'onKeyEvent'
  },
  onClickSearchButtonEvent (event) {
    event.preventDefault()
    event.preventDefault()
    this.input.focus()
  },
  onFocusOutEvent (event) {
    this.input.classList.remove('extended')
  },
  onFocusEvent (event) {
    this.input.classList.add('extended')
  },
  onKeyEvent (event) {
    if (event.target.nodeName.toUpperCase() == 'INPUT') {
      if (event.keyCode === 13) {
        event.preventDefault()
        event.stopPropagation()
        this.startSearch()
        return false
      }
      if (event.keyCode === 27) {
        event.preventDefault()
        event.stopPropagation()
        this.stopSearch()
        return false
      }
    }
  },
  stopSearch () {
    if (this.input_value !== null) {
      // html element
      this.input.value = ""
      // view property
      this.input_value = null
    }
  },
  startSearch () {
    const valueToSearch = this.input.value
    if (!valueToSearch) {
      this.stopSearch()
    } else {
      this.input_value = valueToSearch
    }
  },
  render () {
    this.renderWithTemplate()

    this.input = this.el.querySelector('input')
  }
})
