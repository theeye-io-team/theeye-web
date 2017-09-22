import View from 'ampersand-view'
import $ from 'jquery'
import bootstrap from 'bootstrap'

module.exports = View.extend({
  template: `
    <div data-hook="alert-type" role="alert">
      <button type="button" class="close" data-dismiss="alert" aria-label="Close">
        <span aria-hidden="true">&times;</span>
      </button>
      <strong data-hook="title"></strong>
      <span data-hook="message"></span>
    </div>
  `,
  props: {
    type: ['string', true, 'alert-success'],
    message: ['string', false],
    title: ['string', false],
    timeout: ['number', false, 3]
  },
  derived: {
    typeClass: {
      deps: ['type'],
      fn: function () {
        return this.type + ' alert alert-dismissible shadow fade in'
      }
    }
  },
  bindings: {
    message: {
      type: 'text',
      hook: 'message'
    },
    title: [{
      type: 'text',
      hook: 'title'
    }, {
      type: 'toggle',
      hook: 'title'
    }],
    typeClass: {
      type: 'attribute',
      name: 'class',
      hook: 'alert-type'
    }
  },
  render () {
    this.renderWithTemplate(this)

    const $alert = $(this.el)
    this.$alert = $alert

    $alert.on('closed.bs.alert',() => this.remove())
    //$alert.slideDown()
    $alert.show()

    window.setTimeout(() => {
      $alert.slideUp({
        complete: () => $alert.trigger('closed.bs.alert')
      })
    }, this.timeout * 1000)
  },
  remove () {
    View.prototype.remove.call(this)
    this.$alert.remove()
  }
})
