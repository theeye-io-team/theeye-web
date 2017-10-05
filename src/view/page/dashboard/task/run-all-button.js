import View from 'ampersand-view'

module.exports = View.extend({
  props: {
    visible: ['boolean',false,false],
    disabled: ['boolean',false,true]
  },
  bindings: {
    visible: {
      type: 'toggle'
    },
    disabled: {
      type: 'booleanAttribute',
      name: 'disabled',
      selector: 'button'
    }
  },
  events: {
    'click button':'onClickButton'
  },
  onClickButton (event) {
    event.preventDefault()
    event.stopPropagation()
    if (!this.disabled) {
      this.trigger('runall')
    }
    return false
  },
  template: `
    <section>
      <button class="btn btn-danger btn-block ladda-button"
        data-style="zoom-in"
        style="padding:14px; font-size:16px;">
        <span>Run all these tasks</span>&nbsp;
        <i class="fa fa-forward"
          style="font-size: xx-large; position: absolute; top: 10px;"></i>
      </button>
    </section>
  `
})
