import View from 'ampersand-view'
import ArgumentForm from './form'
import { DinamicArgument as ScriptArgument } from 'models/task/dinamic-argument'
import FIELD from 'constants/field'
module.exports = View.extend({
  template: `
  <div>
    <section>
      <h1>Select the argument type</h1>
      <div class="row task-button" style="text-align:center;">
        <div class="col-xs-4">
          <button data-hook="fixed" class="btn btn-default">
            <i class="icons icons-script fa fa-code"></i>
          </button>
          <h2>Fixed Value
            <span data-hook="script-help"></span>
          </h2>
        </div>
        <div class="col-xs-4">
          <button data-hook="input" class="btn btn-default">
            <i class="icons icons-scraper fa fa-cloud"></i>
          </button>
          <h2>Text Input
            <span data-hook="webhook-help"></span>
          </h2>
        </div>
        <div class="col-xs-4">
          <button data-hook="select" class="btn btn-default">
            <i class="icons icons-scraper fa fa-cloud"></i>
          </button>
          <h2>Options Selection
            <span data-hook="webhook-help"></span>
          </h2>
        </div>
      </div>
    </section>
    <section data-hook="form-container">
    </section>
  </div>
  `,
  props: {
    form: 'state',
    current_type: 'string'
  },
  bindings: {
    //form: {
    //  type: 'toggle',
    //  hook: 'form-container'
    //},
    current_type: { hook: 'current_type' }
  },
  events: {
    'click [data-hook=fixed]':'onClickFixed',
    'click [data-hook=input]':'onClickInput',
    'click [data-hook=select]':'onClickSelect',
  },
  onClickFixed (event) {
    event.preventDefault()
    event.stopPropagation()
    this.renderArgumentForm(FIELD.TYPE_FIXED)
  },
  onClickInput (event) {
    event.preventDefault()
    event.stopPropagation()
    this.renderArgumentForm(FIELD.TYPE_INPUT)
  },
  onClickSelect (event) {
    event.preventDefault()
    event.stopPropagation()
    this.renderArgumentForm(FIELD.TYPE_SELECT)
  },
  /**
   *
   * @param {String} type argument type
   *
   */
  renderArgumentForm (type) {
    if (this.form) {
      this.stopListening(this.form)
      this.form.remove()
      this.form = null
    }

    this.current_type = type
    const argument = new ScriptArgument({ type: this.current_type })

    var form = new ArgumentForm({ model: argument })
    this.renderSubview(form, this.queryByHook('form-container'))

    form.focus()
    this.listenTo(form,'submit',() => { // form submit event
      this.trigger('added',form.data)
    })
    this.form = form
  },
  initialize () {
    View.prototype.initialize.apply(this,arguments)

    this.on('change:current_type', (event) => {
      this.queryAll('button').forEach(btn => btn.classList.remove('btn-primary'))

      this.queryByHook(this.current_type).classList.add('btn-primary')
    })
  },
  remove () {
    if (this.form) this.form.remove()
    View.prototype.remove.apply(this,arguments)
  }
})
