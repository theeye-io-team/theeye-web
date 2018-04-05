import App from 'ampersand-app'
import View from 'ampersand-view'
import Modalizer from 'components/modalizer'
//import ResourceActions from 'actions/resource'
//import HelpTexts from 'language/help'
//import HelpIconView from 'components/help-icon'
import MonitorFormView from '../form'

import { Nested as NestedMonitors } from 'models/resource'

import './styles.less'

const ResourceCreationWizard = View.extend({
  template: `
    <div>
      <section data-hook="type-selection-container" class="task-type-selection">
        <h1>Please, select the monitor type to continue</h1>
        <div class="row task-button" style="text-align:center;">
          <div class="col-xs-6">
            <button data-hook="nested" class="btn btn-default">
              <i class="icons icons-script fa fa-code"></i>
            </button>
            <h2>Nested Monitors
              <span data-hook="script-help"></span>
            </h2>
          </div>
        </div>
      </section>
      <section data-hook="form-container"></section>
    </div>
  `,
  events: {
    'click button[data-hook=nested]': function (event) {
      event.preventDefault()
      event.stopPropagation()
      this.createForm( new NestedMonitors() )
    },
    //'click button[data-hook=scraper]': function (event) {
    //  event.preventDefault()
    //  event.stopPropagation()
    //  this.createForm( new ScraperTask() )
    //}
  },
  render () {
    this.renderWithTemplate(this)

    //this.renderSubview(
    //  new HelpIconView({
    //    color: [50,50,50],
    //    category: 'task_help',
    //    text: HelpTexts.task.creation.webhook
    //  }),
    //  this.queryByHook('webhook-help')
    //)

    //this.renderSubview(
    //  new HelpIconView({
    //    color: [50,50,50],
    //    category: 'task_help',
    //    text: HelpTexts.task.creation.script
    //  }),
    //  this.queryByHook('script-help')
    //)
  },
  /**
   * @param {Resource} resource resource monitor instance
   */
  createForm (resource) {
    this.queryByHook('type-selection-container').remove()
    const form = new MonitorFormView({ model: resource })
    this.renderSubview(form, this.queryByHook('form-container'))
    this.form = form
    this.listenTo(form,'submitted',() => { this.trigger('submitted') })
  },
  remove () {
    if (this.form) this.form.remove()
    View.prototype.remove.apply(this,arguments)
  }
})

module.exports = function () {
  const wizard = new ResourceCreationWizard()
  wizard.render()
  const modal = new Modalizer({
    buttons: false,
    title: 'Create Monitor',
    bodyView: wizard
  })

  modal.on('hidden',() => {
    wizard.remove()
    modal.remove()
  })

  wizard.on('submitted',() => { modal.hide() })
  modal.show()
  modal.wizard = wizard
  return modal
}
