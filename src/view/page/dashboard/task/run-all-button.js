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
      <button class="btn btn-danger btn-block" style="padding:14px; font-size:16px;">
        <span>Run all these tasks</span>&nbsp;
        <i class="fa fa-forward" style="font-size: 25px;display: inline-flex;position: absolute;margin-left: 5px;line-height: 21px;"></i>
      </button>
    </section>
  `
})
