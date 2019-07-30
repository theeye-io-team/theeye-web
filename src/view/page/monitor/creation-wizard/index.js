import App from 'ampersand-app'
import View from 'ampersand-view'
import Modalizer from 'components/modalizer'
import HelpTexts from 'language/help'
import HelpIconView from 'components/help-icon'
import MonitorFormView from '../form'
import config from 'config'

import { Nested as NestedMonitors } from 'models/resource'

import './styles.less'
const docsLink = 'core-concepts/monitors/#monitor-type'

module.exports = function () {
  const wizard = new ResourceCreationWizard()
  wizard.render()
  const modal = new Modalizer({
    buttons: false,
    title: 'Create Monitor',
    bodyView: wizard
  })

  modal.renderSubview(
    new HelpIconView({
      link: `${config.docs}/${docsLink}`
    }),
    modal.queryByHook('title')
  )

  modal.on('hidden',() => {
    wizard.remove()
    modal.remove()
  })

  wizard.on('submitted',() => { modal.hide() })
  modal.show()
  modal.wizard = wizard
  return modal
}

const ResourceCreationWizard = View.extend({
  template: `
    <div>
      <section data-hook="type-selection-container" class="task-type-selection">
        <h1>Please, select the monitor type to continue</h1>
        <div class="row task-button" style="text-align:center;">
          <div class="col-xs-6">
            <button data-hook="nested" class="btn btn-default">
              <i class="icons icons-nested fa fa-bullseye"></i>
            </button>
            <h2>Nested Monitors <span data-hook="nested-help"></span> </h2>
          </div>
          <div class="col-xs-6">
            <a href="/admin/monitor" data-hook="others" class="btn btn-default">
              <i class="icons icons-script fa fa-cogs"></i>
            </a>
            <h2>Other Monitors <span data-hook="others-help"></span> </h2>
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
    //'click button[data-hook=others]': function (event) {
    //  event.preventDefault()
    //  event.stopPropagation()
    //}
  },
  render () {
    this.renderWithTemplate(this)

    this.renderSubview(
      new HelpIconView({
        color: [50,50,50],
        category: 'monitor_wizard_help',
        text: HelpTexts.monitor.wizard.nested
      }),
      this.queryByHook('nested-help')
    )

    this.renderSubview(
      new HelpIconView({
        color: [50,50,50],
        category: 'monitor_wizard_help',
        text: HelpTexts.monitor.wizard.others
      }),
      this.queryByHook('others-help')
    )
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
