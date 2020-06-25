import App from 'ampersand-app'
import View from 'ampersand-view'
import Modalizer from 'components/modalizer'
import HelpTexts from 'language/help'
import HelpIconView from 'components/help-icon'
import MonitorFormView from '../form'
import config from 'config'

import { Factory as ResourceFactory } from 'models/resource'

import './styles.less'
const docsLink = 'core-concepts/monitors/#monitor-type'

export default function () {
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
          <div class="col-xs-3">
            <button data-hook="monitor-form" data-type="file" class="btn btn-default">
              <i class="icons icons-file fa fa-file-o"></i>
            </button>
            <h2>File <span data-hook="file-help"></span> </h2>
          </div>
          <div class="col-xs-3">
            <button data-hook="monitor-form" data-type="process" class="btn btn-default">
              <i class="icons icons-process fa fa-cog"></i>
            </button>
            <h2>Process <span data-hook="process-help"></span> </h2>
          </div>
          <div class="col-xs-3">
            <button data-hook="monitor-form" data-type="script" class="btn btn-default">
              <i class="icons icons-script fa fa-code"></i>
            </button>
            <h2>Script <span data-hook="script-help"></span> </h2>
          </div>
          <div class="col-xs-3">
            <button data-hook="monitor-form" data-type="scraper" class="btn btn-default">
              <i class="icons icons-scraper fa fa-cloud"></i>
            </button>
            <h2>Web Check <span data-hook="scraper-help"></span> </h2>
          </div>
        </div>
        <div class="row task-button" style="text-align:center;">
          <div class="col-xs-3">
            <button data-hook="monitor-form" data-type="nested" class="btn btn-default">
              <i class="icons icons-nested fa fa-bullseye"></i>
            </button>
            <h2>Nested <span data-hook="nested-help"></span> </h2>
          </div>
          <div class="col-xs-3">
            <button data-hook="monitor-form" data-type="dstat" class="btn btn-default">
              <i class="icons icons-health fa fa-bar-chart"></i>
            </button>
            <h2>Bot Host Health <span data-hook="health-help"></span> </h2>
          </div>
          <div class="col-xs-3">
            <button data-hook="monitor-form" data-type="psaux" class="btn btn-default">
              <i class="icons icons-processes fa fa-cogs"></i>
            </button>
            <h2>Bot Host Processes <span data-hook="processes-help"></span> </h2>
          </div>
        </div>
      </section>
      <section data-hook="form-container"></section>
    </div>
  `,
  events: {
    'click button[data-hook=monitor-form]': function (event) {
      event.preventDefault()
      event.stopPropagation()
      let resource = new ResourceFactory({ type: event.delegateTarget.dataset.type })
      this.createForm(resource)
    }
  },
  render () {
    this.renderWithTemplate(this)

    this.addHelpIcon('file')
    this.addHelpIcon('script')
    this.addHelpIcon('process')
    this.addHelpIcon('health')
    this.addHelpIcon('scraper')
    this.addHelpIcon('nested')
    this.addHelpIcon('processes')
  },
  addHelpIcon (type) {
    this.renderSubview(
      new HelpIconView({
        color: [50,50,50],
        category: 'monitor_wizard_help',
        text: HelpTexts.monitor.wizard[type]
      }),
      this.queryByHook(type + '-help')
    )
  },
  /**
   * @param {Resource} resource a resource monitor instance
   */
  createForm (resource) {
    this.queryByHook('type-selection-container').remove()
    const form = new MonitorFormView({ model: resource })
    this.renderSubview(form, this.queryByHook('form-container'))
    this.form = form
    this.listenTo(form, 'submitted', () => { this.trigger('submitted') })
  },
  remove () {
    if (this.form) {
      this.form.remove()
    }
    View.prototype.remove.apply(this,arguments)
  }
})
