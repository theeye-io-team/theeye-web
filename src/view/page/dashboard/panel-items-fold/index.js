import View from 'ampersand-view'
const jquery = $ = require('jquery')

/**
 *
 * view to fold items using a hidden container.
 * folded items are moved from it's base container to this one.
 * to unfold slide the container to show/hide content
 *
 * this is a custom view to attach events to the elements.
 *
 * @param {Object} el dom element
 *
 */
export default View.extend({
  template: () => {
    let html = `
      <section>
        <div data-hook="hidden-items" class="hidden-container">
          <div data-hook="hidden-items-container">
          </div>
        </div>
        <div data-hook="toggle-hidden-items" style="padding:5px 0px 5px 0px; margin: auto; width:100%; color:#fff; text-align:center; cursor:pointer;">
          <span class="btn btn-primary tooltiped fa fa-chevron-down" title="show/hide"></span>
        </div>
      </section>
    `
    return html
  },
  props: {
    visible: ['boolean',false,false]
  },
  bindings: {
    visible: {
      type: 'booleanClass',
      selector: '[data-hook=toggle-hidden-items] span.btn',
      yes: 'fa-chevron-up',
      no: 'fa-chevron-down'
    }
  },
  initialize () {
    View.prototype.initialize.apply(this, arguments)
  },
  render () {
    this.renderWithTemplate()

    let $el = this.$el = $(this.el)
    this.$items = $el.find('[data-hook=hidden-items]')
    this.$button = $el.find('[data-hook=toggle-hidden-items]')
    this.$icon = this.$button.find('span')
  },
  events: {
    'click [data-hook=toggle-hidden-items] span.btn': 'toggleVisibility'
  },
  toggleVisibility () {
    this.$items.slideToggle()
    this.toggle('visible')
  },
  fold () {
    const $items = this.$items
    const $icon = this.$icon
    $items.slideUp()
    this.visible = false
  },
  unfold () {
    const $items = this.$items
    const $icon = this.$icon
    $items.slideDown()
    this.visible = true
  },
  hideButton () {
    this.$button.hide()
  },
  showButton () {
    this.$button.show()
  },
  /**
   * @param {DOM Object} el
   */
  append (el) {
    const container = this.queryByHook('hidden-items-container')
    container.appendChild(el)
  },
  /**
   * @param {DOM Object} el
   */
  prepend (el) {
    const container = this.queryByHook('hidden-items-container')
    container.insertBefore(el, container.firstChild)
  }
})
