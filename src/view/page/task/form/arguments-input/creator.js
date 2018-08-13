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
        <div class="col-xs-2">
          <button data-hook="fixed" class="btn btn-default">
            <i class="icons icons-script fa fa-chain"></i>
          </button>
          <h2>Fixed Value
            <span data-hook="script-help"></span>
          </h2>
        </div>
        <div class="col-xs-2">
          <button data-hook="input" class="btn btn-default">
            <i class="icons icons-scraper fa fa-list"></i>
          </button>
          <h2>Text Input
            <span data-hook="webhook-help"></span>
          </h2>
        </div>
        <div class="col-xs-2">
          <button data-hook="select" class="btn btn-default">
            <i class="icons icons-scraper fa fa-list-ol"></i>
          </button>
          <h2>Options Selection
            <span data-hook="webhook-help"></span>
          </h2>
        </div>
        <div class="col-xs-2">
          <button data-hook="remote-options" class="btn btn-default">
            <i class="icons icons-scraper fa fa-list-ol"></i>
          </button>
          <h2>Remote Options
            <span data-hook="webhook-help"></span>
          </h2>
        </div>
        <div class="col-xs-2">
          <button data-hook="date" class="btn btn-default">
            <i class="icons icons-scraper fa fa-calendar"></i>
          </button>
          <h2>Date Input
            <span data-hook="webhook-help"></span>
          </h2>
        </div>
        <div class="col-xs-2">
          <button data-hook="file" class="btn btn-default">
            <i class="icons icons-scraper fa fa-file-o"></i>
          </button>
          <h2>File Input
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
    'click [data-hook=date]':'onClickDate',
    'click [data-hook=file]':'onClickFile',
    'click [data-hook=remote-options]':'onClickRemoteOptions',
    keydown: 'onKeyEvent',
    keypress: 'onKeyEvent'
  },
  onKeyEvent (event) {
    if(event.target.nodeName.toUpperCase()=='INPUT') {
      if (event.keyCode == 13) {
        event.preventDefault()
        event.stopPropagation()
        return false
      }
    }
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
  onClickRemoteOptions (event) {
    event.preventDefault()
    event.stopPropagation()
    this.renderArgumentForm(FIELD.TYPE_REMOTE_OPTIONS)
  },
  onClickDate (event) {
    event.preventDefault()
    event.stopPropagation()
    this.renderArgumentForm(FIELD.TYPE_DATE)
  },
  onClickFile (event) {
    event.preventDefault()
    event.stopPropagation()
    this.renderArgumentForm(FIELD.TYPE_FILE)
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
    this.listenTo(form,'submitted',() => { // form submit event
      this.trigger('added',form.data)
      form.reset()
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
