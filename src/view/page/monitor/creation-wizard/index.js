import App from 'ampersand-app'
import View from 'ampersand-view'
import Modalizer from 'components/modalizer'
import HelpTexts from 'language/help'
import HelpIconView from 'components/help-icon'
import Catalogue from 'components/catalogue'
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
    <div data-component="monitor-creation-wizard">
      <section data-hook="type-selection-container" class="task-type-selection">
        <h1>Please, select the monitor type to continue</h1>
        <div class="container" data-hook="type-selection-view-container"></div>
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
    const buttons = [
      {
        name: 'File',
        id: 'file',
        description: HelpTexts.monitor.wizard['file'],
        callback: () => {
          let resource = new ResourceFactory({ type: 'file' })
          this.createForm(resource)
        },
        icon_class: 'fa-file-o',
        icon_color: '#ff8a6d'
      },{
        name: 'Process',
        id: 'process',
        description: HelpTexts.monitor.wizard['process'],
        callback: () => {
          let resource = new ResourceFactory({ type: 'process' })
          this.createForm(resource)
        },
        icon_class: 'fa-cog',
        icon_color: '#1c73b9'
      },{
        name: 'Script',
        id: 'script',
        description: HelpTexts.monitor.wizard['script'],
        callback: () => {
          let resource = new ResourceFactory({ type: 'script' })
          this.createForm(resource)
        },
        icon_class: 'fa-code',
        icon_color: '#c6639b'
      },{
        name: 'Web Check',
        id: 'scraper',
        description: HelpTexts.monitor.wizard['scraper'],
        callback: () => {
          let resource = new ResourceFactory({ type: 'scraper' })
          this.createForm(resource)
        },
        icon_class: 'fa-cloud',
        icon_color: '#158df9'
      },{
        name: 'Nested',
        id: 'nested',
        description: HelpTexts.monitor.wizard['nested'],
        callback: () => {
          let resource = new ResourceFactory({ type: 'nested' })
          this.createForm(resource)
        },
        icon_class: 'fa-bullseye',
        icon_color: '#06b777'
      },{
        name: 'Bot Host Health',
        id: 'health',
        description: HelpTexts.monitor.wizard['health'],
        callback: () => {
          let resource = new ResourceFactory({ type: 'dstat' })
          this.createForm(resource)
        },
        icon_class: 'fa-bar-chart',
        icon_color: '#00b4bc'
      },{
        name: 'Bot Host Processes',
        id: 'processes',
        description: HelpTexts.monitor.wizard['processes'],
        callback: () => {
          let resource = new ResourceFactory({ type: 'psaux' })
          this.createForm(resource)
        },
        icon_class: 'fa-cogs',
        icon_color: '#519194'
      }
    ]

    const catalogue = new Catalogue({ buttons })
    this.renderSubview(catalogue, this.queryByHook('type-selection-view-container'))
  },
  /**
   * @param {Resource} resource a resource monitor instance
   */
  createForm (resource) {
    this.queryByHook('type-selection-container').remove()
    const form = new MonitorFormView({ model: resource })
    this.renderSubview(form, this.queryByHook('form-container'))
    this.form = form
    form.on('submitted', () => { this.trigger('submitted') })
  },
  remove () {
    if (this.form) {
      this.form.remove()
    }
    View.prototype.remove.apply(this,arguments)
  }
})
