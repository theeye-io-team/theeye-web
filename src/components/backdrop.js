import View from 'ampersand-view'

module.exports = View.extend({
  autoRender: true,
  template: `<div class="modal-backdrop fade in"></div>`,
  props: {
    visible: ['boolean',false,false],
    zIndex: ['number',false,1040],
    opacity: ['number',false,0.5],
    color: ['string',false,'#FFF']
  },
  bindings: {
    visible: {
      type: 'toggle'
    }
  },
  events: {
    click:'onClick'
  },
  onClick () {
    this.trigger('click')
  },
  render () {
    this.renderWithTemplate(this)
    document.body.appendChild(this.el)

    this.el.style.zIndex = this.zIndex
    this.el.style.opacity = this.opacity
    this.el.style.backgroundColor = this.color
  },
  toggle () {
    this.toggle('visible')
  }
})
