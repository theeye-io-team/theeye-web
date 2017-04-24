import BaseView from 'view/base-view'
import extend from 'lodash/assign'
import FormElement from 'lib/form-element'

module.exports = BaseView.extend({
  template: `
    <form data-hook="form" class="form-horizontal">
      <div class="form-group">
        <label for="name" class="col-sm-3 control-label">Name</label>
        <div class="col-sm-9">
          <input data-hook="name" name="name" class="form-control" placeholder="name">
        </div>
      </div>
    </form>
  `,
  events: {
    keydown: 'onKeyEvent',
    keypress: 'onKeyEvent'
  },
  onKeyEvent (event) {
    if (event.keyCode == 13) {
      event.preventDefault()
      event.stopPropagation()
      return false
    }
  },
  initialize (options) {
    BaseView.prototype.initialize.apply(this,arguments)

    const self = this
    extend(this, options)

    Object.defineProperty(this,'data',{
      get () {
        var form = new FormElement( self.el )
        return form.get()
      },
      set (data) {
        var form = new FormElement( self.el )
        form.set( data )
        return self
      },
      enumerable: true
    })
  },
  render () {
    this.renderWithTemplate(this)

    if (this.model) this.data = this.model._values
  },
  focus () {
    this.find('input[name=name]').focus()
  }
})
